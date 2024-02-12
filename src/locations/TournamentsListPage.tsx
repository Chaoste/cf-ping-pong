import React from "react";
import {
  Button,
  Flex,
  Heading,
  List,
  Skeleton,
  Stack,
  TextLink,
} from "@contentful/f36-components";
import { PageAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { useQuery } from "react-query";
import { useNavigate } from "react-router";
import { PlusIcon } from "@contentful/f36-icons";
import { checkContentTypesReady } from "../utils/checkContentTypes";
import { ContentTypesWarning } from "../components/ContentTypesWarning";

export const TournamentsListPage = () => {
  const navigate = useNavigate();
  const sdk = useSDK<PageAppSDK>();
  const { data: tournaments, isLoading: isLoadingTournaments } = useQuery(
    "tournaments",
    {
      queryFn: () =>
        sdk.cma.entry.getMany({ query: { content_type: "tournament" } }),
    }
  );
  const { data: areContentTypesReady, isLoading: isLoadingContentTypesReady } =
    useQuery("contentTypesReady", () => checkContentTypesReady(sdk));

  const isLoading = isLoadingTournaments || isLoadingContentTypesReady;

  return (
    <Stack flexDirection="column" alignItems="flex-start" padding="spacingL">
      <Flex gap="spacingL" alignItems="flex-start">
        <Heading marginBottom="none">Tournaments</Heading>
        <Button
          startIcon={<PlusIcon />}
          onClick={() => navigate("/tournaments/create")}
          size="small"
          isDisabled={isLoading || !areContentTypesReady}
        >
          Create
        </Button>
      </Flex>
      {isLoading || tournaments === undefined ? (
        <Skeleton.Container>
          <Skeleton.BodyText />
        </Skeleton.Container>
      ) : !areContentTypesReady ? (
        <ContentTypesWarning />
      ) : (
        <List>
          {tournaments.items.map((tournament) => (
            <List.Item key={tournament.sys.id}>
              <TextLink
                as="button"
                onClick={() => navigate(`/tournaments/${tournament.sys.id}`)}
              >
                {tournament.fields.name["en-US"]}
              </TextLink>
            </List.Item>
          ))}
        </List>
      )}
    </Stack>
  );
};
