import React from "react";
import {
  Button,
  Flex,
  Heading,
  List,
  SkeletonBodyText,
  Stack,
  TextLink,
} from "@contentful/f36-components";
import { PageAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { useQuery } from "react-query";
import { useNavigate } from "react-router";
import { PlusIcon } from "@contentful/f36-icons";

export const TournamentsListPage = () => {
  const navigate = useNavigate();
  const sdk = useSDK<PageAppSDK>();
  const { data: tournaments } = useQuery("tournaments", {
    queryFn: () =>
      sdk.cma.entry.getMany({ query: { content_type: "tournament" } }),
  });

  return (
    <Stack flexDirection="column" alignItems="flex-start" padding="spacingL">
      <Flex gap="spacingL" alignItems="flex-start">
        <Heading marginBottom="none">Tournaments</Heading>
        <Button
          startIcon={<PlusIcon />}
          onClick={() => navigate("/tournaments/create")}
          size="small"
        >
          Create
        </Button>
      </Flex>
      {!tournaments ? (
        <SkeletonBodyText />
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
