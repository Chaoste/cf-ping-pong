import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Form,
  FormControl,
  Heading,
  IconButton,
  Notification,
  Skeleton,
  Stack,
  Subheading,
  Textarea,
} from "@contentful/f36-components";
import { ChevronLeftIcon } from "@contentful/f36-icons";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useSDK } from "@contentful/react-apps-toolkit";
import { css } from "emotion";
import { PlayerEntry } from "../types";

const styles = {
  playerCards: css({
    minWidth: "300px",
    width: "80%",
    maxWidth: "800px",
  }),
  playerCard: css({
    width: 220,
    "& *": {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  }),
};

export const BulkCreatePlayersForm = () => {
  const [playersInput, setPlayersInput] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sdk = useSDK();
  const { data: players, isLoading } = useQuery("players", {
    queryFn: () => sdk.cma.entry.getMany({ query: { content_type: "player" } }),
  });
  const { mutate } = useMutation({
    mutationFn: async (playerNames: string[]) => {
      return Promise.all(
        playerNames.map((playerName) => {
          return sdk.cma.entry.create(
            {
              contentTypeId: "player",
            },
            {
              fields: {
                name: {
                  "en-US": playerName,
                },
              },
            }
          );
        })
      );
    },
    onSuccess: (createdEntries) => {
      Notification.success(
        `${createdEntries.length} Players created successfully.`
      );
      queryClient.invalidateQueries("players");
    },
    onError: (error) => {
      console.error(error);
      Notification.error("Something went wrong creating the tournament.");
    },
  });

  const playerNames = playersInput
    .split("\n")
    .map((name) => name.trim())
    .filter((name) => name !== "");
  const handleSubmit = () => {
    if (playerNames.length === 0) {
      return;
    }
    mutate(playerNames);
  };

  const openPlayer = async (playerId: string) => {
    if (!players) return;
    const partyVersion = players.items.find(
      (player) => player.sys.id === playerId
    )?.sys.version;
    const { entity: updatedParty } = await sdk.navigator.openEntry<
      PlayerEntry["fields"]
    >(playerId, {
      slideIn: {
        waitForClose: true,
      },
    });
    if (updatedParty && updatedParty?.sys.version !== partyVersion) {
      queryClient.invalidateQueries(["players"]);
    }
  };

  const isValid = playerNames.length > 0;

  return (
    <Form onSubmit={handleSubmit}>
      <Stack flexDirection="column" alignItems="flex-start" padding="spacingL">
        <Flex gap="spacingS" alignItems="flex-start">
          <IconButton
            size="small"
            variant="transparent"
            icon={<ChevronLeftIcon variant="muted" />}
            aria-label="Back to dashboard"
            onClick={() => navigate("/")}
          />
          <Heading>Players</Heading>
        </Flex>
        <Flex
          alignItems="flex-start"
          fullWidth
          padding="spacingXl"
          paddingBottom="none"
          flexDirection="column"
        >
          <Subheading>Existing Players</Subheading>
          <Flex
            gap="spacingS"
            flexWrap="wrap"
            fullWidth
            className={styles.playerCards}
            marginBottom="spacingXl"
          >
            {isLoading ? (
              <Skeleton.Container width="100%" svgHeight={80}>
                <Skeleton.BodyText />
              </Skeleton.Container>
            ) : (
              players?.items.map((player) => (
                <Card
                  key={player.sys.id}
                  onClick={() => openPlayer(player.sys.id)}
                  className={styles.playerCard}
                >
                  {player.fields.name["en-US"]}
                </Card>
              ))
            )}
          </Flex>
          <FormControl isRequired>
            <FormControl.Label>Create new players</FormControl.Label>
            <Textarea
              value={playersInput}
              placeholder="Add one name per line..."
              rows={10}
              onChange={(event) => setPlayersInput(event.target.value)}
            />
            <FormControl.HelpText>
              Put each player name in a separate line.
            </FormControl.HelpText>
          </FormControl>
        </Flex>
        <Box marginLeft="spacingXl">
          <Button isDisabled={!isValid} variant="positive" type="submit">
            {!playerNames?.length
              ? "Create"
              : playerNames.length === 1
              ? "Create 1 player"
              : `Create ${playerNames.length} players`}
          </Button>
        </Box>
      </Stack>
    </Form>
  );
};
