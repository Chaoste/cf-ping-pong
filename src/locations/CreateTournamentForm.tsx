import React from "react";
import {
  Box,
  Button,
  Flex,
  Form,
  FormControl,
  Heading,
  IconButton,
  Notification,
  Stack,
  TextInput,
} from "@contentful/f36-components";
import { ChevronLeftIcon } from "@contentful/f36-icons";
import {
  FormProvider,
  useForm,
  useFormContext,
  useFormState,
} from "react-hook-form";
import { useNavigate } from "react-router";
import { PlayersMultiselect } from "../components/PlayersMultiselect";
import { useMutation } from "react-query";
import { useSDK } from "@contentful/react-apps-toolkit";
import { MatchesInput } from "../components/MatchesInput";
import { CreateTournamentFormFields } from "../types";
import { createMatchTree } from "../utils";

export const CreateTournamentForm = () => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <CreateTournamentFormContents />
    </FormProvider>
  );
};

const CreateTournamentFormContents = () => {
  const navigate = useNavigate();
  const sdk = useSDK();
  const { handleSubmit, register } =
    useFormContext<CreateTournamentFormFields>();
  const { isValid } = useFormState();
  const { mutate } = useMutation({
    mutationFn: async (data: CreateTournamentFormFields) => {
      const allMatches = createMatchTree(data.matches);
      const matchEntries = await Promise.all(
        allMatches.map((match) =>
          sdk.cma.entry.create(
            { contentTypeId: "match" },
            {
              fields: {
                matchNumber: {
                  "en-US": match.matchNumber,
                },
                round: {
                  "en-US": match.round,
                },
                roundMatchIndex: {
                  "en-US": match.roundMatchIndex,
                },
                isUpperBracket: {
                  "en-US": match.isUpperBracket,
                },
                player1: {
                  "en-US": match.player1,
                },
                player2: {
                  "en-US": match.player2,
                },
              },
            }
          )
        )
      );

      return sdk.cma.entry.create(
        {
          contentTypeId: "tournament",
        },
        {
          fields: {
            name: {
              "en-US": data.name,
            },
            players: {
              "en-US": data.players.map((id) => ({
                sys: {
                  type: "Link",
                  linkType: "Entry",
                  id,
                },
              })),
            },
            matches: {
              "en-US": matchEntries.map((matchEntry) => ({
                sys: {
                  type: "Link",
                  linkType: "Entry",
                  id: matchEntry.sys.id,
                },
              })),
            },
          },
        }
      );
    },
    onSuccess: (createdEntry) => {
      navigate(`/tournaments/${createdEntry.sys.id}`);
    },
    onError: (error) => {
      console.error(error);
      Notification.error("Something went wrong creating the tournament.");
    },
  });

  const submitForm = (data: CreateTournamentFormFields) => {
    mutate(data);
  };

  return (
    <Form onSubmit={handleSubmit(submitForm as any)}>
      <Stack flexDirection="column" alignItems="flex-start" padding="spacingL">
        <Flex gap="spacingS" alignItems="flex-start">
          <IconButton
            size="small"
            variant="transparent"
            icon={<ChevronLeftIcon variant="muted" />}
            aria-label="Back to dashboard"
            onClick={() => navigate("/")}
          />
          <Heading>Create New Tournament</Heading>
        </Flex>
        <Flex alignItems="flex-start" fullWidth gap="128px" padding="spacingXl">
          <Box>
            <FormControl>
              <FormControl.Label isRequired>Name</FormControl.Label>
              <TextInput
                {...register("name", { required: true })}
                placeholder="Name of the tournament"
              />
            </FormControl>
            <FormControl>
              <FormControl.Label isRequired>Players</FormControl.Label>
              <PlayersMultiselect />
            </FormControl>
          </Box>
          <Box>
            <FormControl>
              <FormControl.Label isRequired>Matches</FormControl.Label>
              <MatchesInput />
            </FormControl>
          </Box>
        </Flex>
        <Box marginTop="spacing2Xl" marginLeft="spacingXl">
          <Button isDisabled={!isValid} variant="positive" type="submit">
            Create
          </Button>
        </Box>
      </Stack>
    </Form>
  );
};
