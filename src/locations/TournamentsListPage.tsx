import React from "react";
import {
  Box,
  Button,
  Card,
  Text,
  Flex,
  Heading,
  Skeleton,
  Stack,
} from "@contentful/f36-components";
import { PageAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { useQuery } from "react-query";
import { useNavigate } from "react-router";
import { PlusIcon } from "@contentful/f36-icons";
import { checkContentTypesReady } from "../utils/checkContentTypes";
import { ContentTypesWarning } from "../components/ContentTypesWarning";
import { TournamentEntry } from "../types";
import { css } from "emotion";

const styles = {
  card: css({
    minWidth: "300px",
    width: "50%",
    maxWidth: "600px",
  }),
};

export const TournamentsListPage = () => {
  const navigate = useNavigate();
  const sdk = useSDK<PageAppSDK>();
  const {
    data: areContentTypesReady,
    error,
    isLoading: isLoadingContentTypesReady,
  } = useQuery("contentTypesReady", () => checkContentTypesReady(sdk));
  const { data: tournaments, isLoading: isLoadingTournaments } = useQuery(
    "tournaments",
    {
      queryFn: () =>
        sdk.cma.entry.getMany<TournamentEntry["fields"]>({
          query: { content_type: "tournament" },
        }),
      enabled: Boolean(!isLoadingContentTypesReady && areContentTypesReady),
    }
  );

  const isLoading = isLoadingTournaments || isLoadingContentTypesReady;

  return (
    <Stack flexDirection="column" alignItems="flex-start" padding="spacingL">
      <Flex gap="spacingL" alignItems="flex-start">
        <Heading marginBottom="none">Tournaments</Heading>
        {tournaments?.items.length && (
          <Button
            startIcon={<PlusIcon />}
            onClick={() => navigate("/tournaments/create")}
            size="small"
            isDisabled={isLoading || !areContentTypesReady}
          >
            Create
          </Button>
        )}
      </Flex>
      {isLoading ? (
        <Skeleton.Container>
          <Skeleton.BodyText />
        </Skeleton.Container>
      ) : !areContentTypesReady || error || tournaments === undefined ? (
        <ContentTypesWarning />
      ) : tournaments.items.length === 0 ? (
        <>
          <Text>No tournaments found.</Text>
          <Button
            startIcon={<PlusIcon />}
            onClick={() => navigate("/tournaments/create")}
            variant="primary"
            style={{ maxWidth: "none" }}
            isDisabled={isLoading || !areContentTypesReady}
          >
            Create your first tournament
          </Button>
        </>
      ) : (
        <>
          {tournaments.items.map((tournament) => (
            <Card
              key={tournament.sys.id}
              onClick={() => navigate(`/tournaments/${tournament.sys.id}`)}
              className={styles.card}
            >
              <Flex justifyContent="space-between">
                {tournament.fields.name["en-US"]}
                <Box>
                  <Text fontColor="gray400">
                    {tournament.fields.players["en-US"].length} Players
                  </Text>
                  <Text marginLeft="spacingL" fontColor="gray400">
                    {tournament.fields.matches["en-US"].length} Matches
                  </Text>
                </Box>
              </Flex>
            </Card>
          ))}
        </>
      )}
    </Stack>
  );
};
