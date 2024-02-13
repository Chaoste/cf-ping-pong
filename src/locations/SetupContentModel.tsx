import React from "react";
import { useNavigate } from "react-router";
import {
  Button,
  Flex,
  Heading,
  IconButton,
  Skeleton,
  Stack,
  Table,
} from "@contentful/f36-components";
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  PlusIcon,
} from "@contentful/f36-icons";
import {
  checkMatchReady,
  checkPlayerReady,
  checkTournamentReady,
} from "../utils/checkContentTypes";
import { PageAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { useQuery, useQueryClient } from "react-query";
import { css, cx } from "emotion";
import {
  createMatchContentType,
  createPlayerContentType,
  createTournamentContentType,
} from "../utils/createContentTypes";
import tokens from "@contentful/f36-tokens";

const styles = {
  table: css({
    minWidth: 300,
    width: "50%",
    maxWidth: 600,
    borderSpacing: 2,
  }),
  tableRow: css({
    "& td": {
      height: 60,
      verticalAlign: "middle",
      background: "rgba(255, 255, 255, 0.7) !important",
      color: "black",
    },
  }),
  tableRowPositive: css({
    backgroundColor: tokens.colorPositive,
  }),
  tableRowWarning: css({
    backgroundColor: tokens.red400,
  }),
};

export const SetupContentModel = () => {
  const navigate = useNavigate();
  const sdk = useSDK<PageAppSDK>();
  const queryClient = useQueryClient();

  const { data: readiness, isLoading } = useQuery(
    "separateContentTypeChecks",
    () =>
      Promise.all([
        checkTournamentReady(sdk),
        checkPlayerReady(sdk),
        checkMatchReady(sdk),
      ])
  );

  const contentTypeConfigs = [
    {
      name: "Tournament",
      isSetup: readiness?.[0],
      create: () => createTournamentContentType(sdk),
    },
    {
      name: "Player",
      isSetup: readiness?.[1],
      create: () => createPlayerContentType(sdk),
    },
    {
      name: "Match",
      isSetup: readiness?.[2],
      create: () => createMatchContentType(sdk),
    },
  ];

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
        <Flex justifyContent="space-between" fullWidth>
          <Heading>Setup Content Model</Heading>
        </Flex>
      </Flex>
      {isLoading || !readiness ? (
        <Skeleton.Container>
          <Skeleton.BodyText />
        </Skeleton.Container>
      ) : (
        <Table className={styles.table}>
          <Table.Head>
            <Table.Row>
              <Table.Cell>Content Type</Table.Cell>
              <Table.Cell width="160px">Ready</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {contentTypeConfigs.map((contentTypeConfig) => (
              <Table.Row
                key={contentTypeConfig.name}
                className={cx(styles.tableRow, {
                  [styles.tableRowPositive]: contentTypeConfig.isSetup,
                  [styles.tableRowWarning]: !contentTypeConfig.isSetup,
                })}
              >
                <Table.Cell>{contentTypeConfig.name}</Table.Cell>
                <Table.Cell>
                  {contentTypeConfig.isSetup ? (
                    <CheckCircleIcon variant="positive" />
                  ) : (
                    <Button
                      startIcon={<PlusIcon />}
                      onClick={async () => {
                        await contentTypeConfig.create();
                        queryClient.invalidateQueries(
                          "separateContentTypeChecks"
                        );
                        queryClient.invalidateQueries("contentTypesReady");
                      }}
                      size="small"
                      variant="primary"
                    >
                      Create
                    </Button>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Stack>
  );
};
