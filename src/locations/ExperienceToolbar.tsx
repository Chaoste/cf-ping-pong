import {
  Box,
  Button,
  Card,
  Flex,
  FormControl,
  Heading,
  IconButton,
  Notification,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@contentful/f36-components";
import { CycleIcon, EditIcon } from "@contentful/f36-icons";
import { ExperienceCanvasToolbarAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { MatchEntry, PlayerEntry, TournamentEntry } from "../types";
import { MatchResult, recordMatchResult } from "../utils/recordMatchResult";

type TournamentMatches = {
  matches: MatchEntry[];
  players: PlayerEntry[];
  tournament: TournamentEntry;
};

type SetScore = Pick<MatchResult, "resultSet1" | "resultSet2" | "resultSet3">;

const scoreFields: Array<keyof SetScore> = [
  "resultSet1",
  "resultSet2",
  "resultSet3",
];

const playerId = (match: MatchEntry, player: "player1" | "player2") =>
  match.fields[player]?.["en-US"]?.sys.id;

const isReadyMatch = (match: MatchEntry) =>
  playerId(match, "player1") !== undefined &&
  playerId(match, "player2") !== undefined &&
  match.fields.winner?.["en-US"] === undefined;

const sortMatches = (left: MatchEntry, right: MatchEntry) => {
  const leftRound = left.fields.round?.["en-US"] ?? Number.MAX_SAFE_INTEGER;
  const rightRound = right.fields.round?.["en-US"] ?? Number.MAX_SAFE_INTEGER;
  if (leftRound !== rightRound) {
    return leftRound - rightRound;
  }

  const leftIsUpper = left.fields.isUpperBracket?.["en-US"];
  const rightIsUpper = right.fields.isUpperBracket?.["en-US"];
  if (leftIsUpper !== rightIsUpper) {
    return leftIsUpper ? -1 : 1;
  }

  return (
    (left.fields.roundMatchIndex?.["en-US"] ?? 0) -
    (right.fields.roundMatchIndex?.["en-US"] ?? 0)
  );
};

const normalizeScore = (score: string) => {
  const match = score.trim().match(/^(\d+)\s*-\s*(\d+)$/);
  return match ? `${match[1]} - ${match[2]}` : undefined;
};

const experienceLookupUrl =
  process.env.REACT_APP_EXPERIENCE_LOOKUP_URL ??
  "https://cf-ping-pong-git-f-861b22-thomas-kellermeiers-projects-be0cbd2c.vercel.app/api/experience-tournament";

type TournamentLookupResponse = {
  dataAssemblyId: string;
  tournamentId: string;
};

const isTournamentLookupResponse = (
  value: unknown,
): value is TournamentLookupResponse =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as TournamentLookupResponse).dataAssemblyId === "string" &&
  typeof (value as TournamentLookupResponse).tournamentId === "string";

const getExperienceTournamentId = async (
  sdk: ExperienceCanvasToolbarAppSDK,
) => {
  const { entityId: experienceId, type } = sdk.experiences.context;
  if (type !== "experience") {
    throw new Error("Tournament lookup is only available for Experiences.");
  }

  console.info("[cf-ping-pong] Backend tournament lookup started.", {
    endpoint: experienceLookupUrl,
    environmentId: sdk.ids.environment,
    experienceId,
  });
  const response = await fetch(
    `${experienceLookupUrl}?${new URLSearchParams({
      environment_id: sdk.ids.environment,
      experienceId,
    })}`,
  );
  if (!response.ok) {
    throw new Error(`Experience lookup failed (${response.status}).`);
  }

  const data: unknown = await response.json();
  if (!isTournamentLookupResponse(data)) {
    throw new Error("Experience lookup returned no tournament.");
  }

  console.info("[cf-ping-pong] Backend tournament lookup succeeded.", {
    dataAssemblyId: data.dataAssemblyId,
    experienceId,
    tournamentId: data.tournamentId,
  });
  return data.tournamentId;
};

const useExperienceTournament = (sdk: ExperienceCanvasToolbarAppSDK) => {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>();
  const [selectionError, setSelectionError] = useState<string>();
  const [isResolvingTournament, setIsResolvingTournament] = useState(true);

  const updateTournament = useCallback(async () => {
    setIsResolvingTournament(true);
    try {
      setSelectionError(undefined);
      setSelectedTournamentId(await getExperienceTournamentId(sdk));
    } catch (error) {
      console.warn(
        "[cf-ping-pong] Backend tournament lookup failed; manual selection remains available.",
        error,
      );
      setSelectedTournamentId(undefined);
      setSelectionError("The tournament could not be selected automatically.");
    } finally {
      setIsResolvingTournament(false);
    }
  }, [sdk]);

  useEffect(() => {
    void updateTournament();
    return sdk.experiences.onContextChanged(() => {
      void updateTournament();
    });
  }, [sdk.experiences, updateTournament]);

  return { isResolvingTournament, selectedTournamentId, selectionError };
};

const loadTournamentMatches = async (
  sdk: ExperienceCanvasToolbarAppSDK,
  tournamentId: string,
): Promise<TournamentMatches> => {
  const tournament = (await sdk.cma.entry.get({
    entryId: tournamentId,
  })) as TournamentEntry;
  const matchIds = tournament.fields.matches?.["en-US"]
    ?.map((match) => match.sys.id)
    .filter(Boolean);
  const matches = matchIds?.length
    ? ((await sdk.cma.entry.getMany({
        query: { "sys.id[in]": matchIds.join(",") },
      })).items as MatchEntry[])
    : [];
  const playerIds = Array.from(
    new Set(
      matches.flatMap((match) => [
        playerId(match, "player1"),
        playerId(match, "player2"),
      ]),
    ),
  ).filter((id): id is string => id !== undefined);
  const players = playerIds.length
    ? ((await sdk.cma.entry.getMany({
        query: { "sys.id[in]": playerIds.join(",") },
      })).items as PlayerEntry[])
    : [];

  return { matches, players, tournament };
};

export const ExperienceToolbar = () => {
  const sdk = useSDK<ExperienceCanvasToolbarAppSDK>();

  useEffect(() => {
    sdk.window.startAutoResizer();
    return () => sdk.window.stopAutoResizer();
  }, [sdk.window]);

  const { isResolvingTournament, selectedTournamentId, selectionError } =
    useExperienceTournament(sdk);
  const [chosenTournamentId, setChosenTournamentId] = useState<string>();
  const tournamentId = selectedTournamentId ?? chosenTournamentId;
  const tournamentQuery = useQuery(
    ["experience-toolbar-tournament", sdk.ids.environment, tournamentId],
    () => loadTournamentMatches(sdk, tournamentId!),
    { enabled: tournamentId !== undefined },
  );
  const [savingMatchId, setSavingMatchId] = useState<string>();
  const players = useMemo(
    () =>
      new Map(
        tournamentQuery.data?.players.map((player) => [
          player.sys.id,
          player,
        ]),
      ),
    [tournamentQuery.data?.players],
  );
  const readyMatches = useMemo(
    () =>
      (tournamentQuery.data?.matches ?? []).filter(isReadyMatch).sort(sortMatches),
    [tournamentQuery.data?.matches],
  );

  const chooseTournament = async () => {
    const tournament = await sdk.dialogs.selectSingleEntry<TournamentEntry>({
      contentTypes: ["tournament"],
    });
    if (tournament) {
      setChosenTournamentId(tournament.sys.id);
    }
  };

  const saveResult = async (match: MatchEntry, result: MatchResult) => {
    if (!tournamentQuery.data) {
      return;
    }

    setSavingMatchId(match.sys.id);
    try {
      const recorded = await recordMatchResult({
        match,
        matches: tournamentQuery.data.matches,
        result,
        updateMatch: (entry) =>
          sdk.cma.entry.update({ entryId: entry.sys.id }, entry) as Promise<MatchEntry>,
      });
      Notification.success(
        recorded.successors.length > 0
          ? "Result recorded and the next match has been updated."
          : "Result recorded.",
      );
      await tournamentQuery.refetch();
    } catch (error) {
      console.error("[cf-ping-pong] Could not record match result", error);
      Notification.error("The match result could not be saved.");
    } finally {
      setSavingMatchId(undefined);
    }
  };

  return (
    <Stack flexDirection="column" spacing="spacingS" padding="spacingM">
      <Flex alignItems="center" fullWidth gap="spacingS">
        <Heading marginBottom="none">Match desk</Heading>
        {tournamentId && (
          <Flex alignItems="center" gap="spacing2Xs" marginLeft="auto">
            <Tooltip content="Refresh matches" placement="bottom">
              <IconButton
                aria-label="Refresh matches"
                icon={<CycleIcon />}
                isDisabled={tournamentQuery.isFetching}
                onClick={() => void tournamentQuery.refetch()}
                size="small"
                variant="secondary"
              />
            </Tooltip>
            <Tooltip content="Change tournament" placement="bottom">
              <IconButton
                aria-label="Change tournament"
                icon={<EditIcon />}
                onClick={() => void chooseTournament()}
                size="small"
                variant="secondary"
              />
            </Tooltip>
          </Flex>
        )}
      </Flex>
      {!tournamentId && (
        <Stack flexDirection="column" spacing="spacingS">
          <Text>
            {selectionError ??
              "Select a tournament dashboard component, or choose the tournament to manage."}
          </Text>
          <Button
            isLoading={isResolvingTournament}
            onClick={() => void chooseTournament()}
            variant="secondary"
          >
            Choose tournament
          </Button>
        </Stack>
      )}
      {tournamentQuery.isLoading && (
        <Skeleton.Container>
          <Skeleton.BodyText numberOfLines={4} />
        </Skeleton.Container>
      )}
      {tournamentQuery.isError && (
        <Text fontColor="red600">Could not load the selected tournament.</Text>
      )}
      {tournamentQuery.data && (
        <>
          <Box>
            <Flex alignItems="center" justifyContent="space-between">
              <Box>
                <Text fontColor="gray600">Tournament</Text>
                <Heading as="h2" marginBottom="none">
                  {tournamentQuery.data.tournament.fields.name?.["en-US"] ??
                    "Tournament"}
                </Heading>
              </Box>
            </Flex>
          </Box>
          {readyMatches.length === 0 ? (
            <Text>No matches are ready to report right now.</Text>
          ) : (
            <Stack flexDirection="column" spacing="spacingS">
              {readyMatches.map((match) => (
                <MatchResultCard
                  key={match.sys.id}
                  isSaving={savingMatchId === match.sys.id}
                  match={match}
                  onSave={saveResult}
                  players={players}
                />
              ))}
            </Stack>
          )}
        </>
      )}
    </Stack>
  );
};

interface MatchResultCardProps {
  isSaving: boolean;
  match: MatchEntry;
  onSave: (match: MatchEntry, result: MatchResult) => Promise<void>;
  players: Map<string, PlayerEntry>;
}

const MatchResultCard = ({
  isSaving,
  match,
  onSave,
  players,
}: MatchResultCardProps) => {
  const [winner, setWinner] = useState<boolean>();
  const [scores, setScores] = useState<SetScore>({});
  const player1 = players.get(playerId(match, "player1") ?? "");
  const player2 = players.get(playerId(match, "player2") ?? "");
  const player1Name = player1?.fields.name?.["en-US"] ?? "Player 1";
  const player2Name = player2?.fields.name?.["en-US"] ?? "Player 2";
  const hasInvalidScore = Object.values(scores).some(
    (score) => score !== undefined && score.trim() !== "" && !normalizeScore(score),
  );

  const save = async () => {
    if (winner === undefined || hasInvalidScore) {
      return;
    }

    await onSave(match, {
      winner,
      ...Object.fromEntries(
        scoreFields.map((field) => [field, normalizeScore(scores[field] ?? "")]),
      ),
    });
  };

  return (
    <Card padding="none">
      <Stack flexDirection="column" padding="spacingS" spacing="spacingS">
        <Box>
          <Heading as="h3" marginBottom="none">
            {match.fields.matchNumber?.["en-US"] ?? "Match"}
          </Heading>
          <Text fontColor="gray600">
            {match.fields.isUpperBracket?.["en-US"] ? "Upper" : "Lower"} bracket · Round{" "}
            {match.fields.round?.["en-US"] ?? "—"}
          </Text>
        </Box>
        <Flex flexDirection="column" gap="spacing2Xs">
          <Button
            isDisabled={isSaving}
            onClick={() => setWinner(true)}
            size="small"
            variant={winner === true ? "positive" : "secondary"}
          >
            {player1Name} won
          </Button>
          <Button
            isDisabled={isSaving}
            onClick={() => setWinner(false)}
            size="small"
            variant={winner === false ? "positive" : "secondary"}
          >
            {player2Name} won
          </Button>
        </Flex>
        <Flex gap="spacing2Xs">
          {scoreFields.map((field, index) => (
            <FormControl key={field} isInvalid={
              scores[field] !== undefined &&
              scores[field].trim() !== "" &&
              !normalizeScore(scores[field])
            }>
              <FormControl.Label marginBottom="spacing2Xs">
                Set {index + 1}
              </FormControl.Label>
              <TextInput
                aria-label={`Set ${index + 1} score`}
                isDisabled={isSaving}
                onChange={(event) =>
                  setScores((current) => ({
                    ...current,
                    [field]: event.target.value,
                  }))
                }
                placeholder="11 - 8"
                size="small"
                value={scores[field] ?? ""}
              />
            </FormControl>
          ))}
        </Flex>
        {hasInvalidScore && (
          <Text fontColor="red600">Use a score such as 11 - 8.</Text>
        )}
        <Button
          isDisabled={winner === undefined || hasInvalidScore}
          isLoading={isSaving}
          onClick={() => void save()}
          size="small"
          variant="positive"
        >
          Record result
        </Button>
      </Stack>
    </Card>
  );
};
