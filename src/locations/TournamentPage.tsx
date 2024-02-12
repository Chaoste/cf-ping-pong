import React from "react";
import {
  Box,
  Flex,
  Heading,
  IconButton,
  Notification,
  Skeleton,
  Stack,
  TextLink,
} from "@contentful/f36-components";
import { PageAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router";
import { ChevronLeftIcon } from "@contentful/f36-icons";
import { Link } from "contentful-management";
import { DoubleElimininationTree } from "../components/DoubleEliminationTree";
import { MatchEntry, PlayerEntry, TournamentEntry } from "../types";

export const TournamentPage = () => {
  const navigate = useNavigate();
  const { tournamentId } = useParams();
  const sdk = useSDK<PageAppSDK>();
  const { data: tournament, isLoading: isLoadingTournament } = useQuery(
    ["tournaments", tournamentId],
    {
      queryFn: () => sdk.cma.entry.get({ entryId: tournamentId! }),
      enabled: !!tournamentId,
      onError: () => {
        Notification.error("Could not load the tournament.");
      },
    }
  );
  const { data: players, isLoading: isLoadingPlayers } = useQuery(["players"], {
    queryFn: () => sdk.cma.entry.getMany({ query: { content_type: "player" } }),
    enabled: !!tournament,
    onError: () => {
      Notification.error("Could not load the players.");
    },
  });
  const { data: matches, isLoading: isLoadingMatches } = useQuery(
    ["tournaments", tournamentId, "matches"],
    {
      queryFn: () =>
        sdk.cma.entry.getMany({
          query: {
            "sys.id[in]": tournament!.fields.matches["en-US"]
              .map((match: Link<"Entry">) => match.sys.id)
              .join(","),
          },
        }),
      enabled: !!tournament,
      onError: () => {
        Notification.error("Could not load the matches.");
      },
    }
  );

  const isLoading = isLoadingTournament || isLoadingPlayers || isLoadingMatches;

  return (
    <Stack flexDirection="column" alignItems="flex-start" padding="spacingL">
      <Flex gap="spacingS" alignItems="flex-start" fullWidth>
        <IconButton
          size="small"
          variant="transparent"
          icon={<ChevronLeftIcon variant="muted" />}
          aria-label="Back to dashboard"
          onClick={() => navigate("/")}
        />
        {!tournament ? (
          <Skeleton.Container svgHeight={32}>
            <Skeleton.DisplayText offsetTop={6} width={200} />
          </Skeleton.Container>
        ) : (
          <Flex justifyContent="space-between" fullWidth>
            <Heading>Tournament {tournament.fields.name["en-US"]}</Heading>
            <Box marginTop="spacing2Xs">
              <TextLink
                as="button"
                onClick={() => {
                  sdk.navigator.openEntry(tournament.sys.id, {
                    slideIn: true,
                  });
                }}
              >
                View in Contentful
              </TextLink>
            </Box>
          </Flex>
        )}
      </Flex>
      {isLoading ? (
        <Skeleton.Container svgWidth="50%">
          <Skeleton.BodyText numberOfLines={4} />
        </Skeleton.Container>
      ) : (
        matches?.items &&
        players?.items &&
        tournament && (
          <DoubleElimininationTree
            tournament={tournament as TournamentEntry}
            matches={matches.items as MatchEntry[]}
            players={players.items as PlayerEntry[]}
          />
        )
      )}
    </Stack>
  );
};
