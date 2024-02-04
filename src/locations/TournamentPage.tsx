import React from "react";
import {
  Box,
  Flex,
  Heading,
  IconButton,
  List,
  Notification,
  SkeletonBodyText,
  SkeletonContainer,
  SkeletonDisplayText,
  Stack,
  Subheading,
  TextLink,
} from "@contentful/f36-components";
import { PageAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router";
import { ArrowForwardIcon, ChevronLeftIcon } from "@contentful/f36-icons";
import { EntryProps, Link } from "contentful-management";
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
          <SkeletonContainer svgHeight={32}>
            <SkeletonDisplayText offsetTop={6} width={200} />
          </SkeletonContainer>
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
        <SkeletonContainer svgWidth="50%">
          <SkeletonBodyText numberOfLines={4} />
        </SkeletonContainer>
      ) : (
        <>
          <Box>
            <Subheading>Players</Subheading>
            <List>
              {tournament!.fields.players["en-US"].map(
                (playerLink: Link<"Entry">) => (
                  <List.Item key={playerLink.sys.id}>
                    {players!.items.find(
                      (player: EntryProps) =>
                        player.sys.id === playerLink.sys.id
                    )?.fields.name["en-US"] ?? ""}
                  </List.Item>
                )
              )}
            </List>
          </Box>
          <Box>
            <Subheading marginTop="spacingL">Matches</Subheading>
            <List>
              {tournament!.fields.matches["en-US"].map(
                (matchLink: Link<"Entry">) => {
                  const match = matches!.items.find(
                    (match: EntryProps) => match.sys.id === matchLink.sys.id
                  );
                  const player1 = players!.items.find(
                    (player: EntryProps) =>
                      player.sys.id === match?.fields.player1?.["en-US"]?.sys.id
                  );
                  const player2 = players!.items.find(
                    (player: EntryProps) =>
                      player.sys.id === match?.fields.player2?.["en-US"]?.sys.id
                  );
                  if (!match) return null;
                  return (
                    <List.Item key={matchLink.sys.id}>
                      <b>#{match.fields.matchNumber["en-US"] ?? ""}:</b>&nbsp;
                      {player1?.fields.name["en-US"] ?? "-"} vs{" "}
                      {player2?.fields.name["en-US"] ?? "-"}
                      {player1 || player2 ? (
                        <Box marginLeft="spacingS" display="inline">
                          <TextLink
                            icon={<ArrowForwardIcon />}
                            as="button"
                            onClick={() => {
                              sdk.navigator.openEntry(match.sys.id, {
                                slideIn: true,
                              });
                              // TODO: Catch response and update match state
                            }}
                          >
                            Insert Results
                          </TextLink>
                        </Box>
                      ) : (
                        <></>
                      )}
                    </List.Item>
                  );
                }
              )}
            </List>
          </Box>
        </>
      )}
      {matches?.items && players?.items && tournament && (
        <DoubleElimininationTree
          tournament={tournament as TournamentEntry}
          matches={matches.items as MatchEntry[]}
          players={players.items as PlayerEntry[]}
        />
      )}
    </Stack>
  );
};
