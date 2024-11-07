import React, { useRef } from "react";
import {
  DoubleEliminationBracket,
  Match as MatchComponent,
  OptionsType,
  SVGViewer,
  createTheme,
} from "@g-loot/react-tournament-brackets";
import { MatchEntry, PlayerEntry, TournamentEntry } from "../types";
import { Link } from "contentful-management";
import { useSDK } from "@contentful/react-apps-toolkit";
import { PageAppSDK } from "@contentful/app-sdk";
import { useParams } from "react-router";
import { useQueryClient } from "react-query";
import tokens from "@contentful/f36-tokens";
import useComponentSize from "@rehooks/component-size";

const WhiteTheme = createTheme({
  textColor: { main: "#000000", highlighted: "#07090D", dark: "#3E414D" },
  matchBackground: { wonColor: tokens.green300, lostColor: tokens.blue200 },
  score: {
    background: { wonColor: tokens.green200, lostColor: "white" },
    text: {
      highlightedWonColor: tokens.green700,
      highlightedLostColor: tokens.red700,
    },
  },
  border: {
    color: tokens.blue200,
    highlightedColor: tokens.purple400,
  },
  roundHeader: { fontColor: "#FFFFFF" },
  roundHeaders: { background: tokens.purple400 },
  connectorColor: tokens.blue200,
  connectorColorHighlight: tokens.purple400,
  svgBackground: "#FFFFFF",
});

type DoubleElimininationTreeProps = {
  tournament: TournamentEntry;
  matches: MatchEntry[];
  players: PlayerEntry[];
};

type MatchesMap = {
  upper: {
    [roundIndex: number]: {
      [matchIndex: number]: MatchEntry;
    };
  };
  lower: {
    [roundIndex: number]: {
      [matchIndex: number]: MatchEntry;
    };
  };
};

const toVisualMatch = (
  match: MatchEntry,
  players: PlayerEntry[],
  matchesMap: MatchesMap
) => {
  const round = match.fields.round["en-US"];
  const roundMatchIndex = match.fields.roundMatchIndex["en-US"];
  const isUpper = match.fields.isUpperBracket["en-US"];
  const bracket = isUpper ? matchesMap.upper : matchesMap.lower;
  const nextRoundMatchIndex =
    isUpper || round % 2 === 0
      ? Math.ceil(roundMatchIndex / 2)
      : roundMatchIndex;
  let nextMatch: MatchEntry | null = bracket[round + 1]?.[nextRoundMatchIndex];
  if (!isUpper && !nextMatch) {
    const lastRound = Object.keys(matchesMap.upper).length;
    // The last lower bracket match points again to the final in the upper bracket at the end
    nextMatch = matchesMap.upper[lastRound]?.[1] as MatchEntry | null;
  }

  let nextLoserMatch: MatchEntry | null = null;
  if (isUpper && !match.fields.matchNumber["en-US"]?.startsWith("Final")) {
    const nextLoserMatchRound = Math.max(1, 2 * (round - 1)); // 1>1, 2>2, 3>4, 4>6, 5>8
    const amountLoserRoundMatches = Object.values(
      matchesMap.lower[nextLoserMatchRound]
    ).length;
    const nextLoserMatchRoundIndex =
      round === 1
        ? Math.ceil(roundMatchIndex / 2)
        : round % 2 === 0
        ? amountLoserRoundMatches - roundMatchIndex + 1
        : roundMatchIndex;
    nextLoserMatch =
      matchesMap.lower[nextLoserMatchRound][nextLoserMatchRoundIndex];
  }

  let setsWonByPlayer1 = 0;
  let setsWonByPlayer2 = 0;
  const sets = [
    match.fields.resultSet1?.["en-US"],
    match.fields.resultSet2?.["en-US"],
    match.fields.resultSet3?.["en-US"],
  ];
  sets.forEach((set) => {
    if (set) {
      const [score1, score2] = set.split("-").map(Number);
      if (!score1 || !score2) return;
      if (score1 > score2) {
        setsWonByPlayer1++;
      } else {
        setsWonByPlayer2++;
      }
    }
  });

  const hasGameFinished = match.fields.winner?.["en-US"] !== undefined;
  const isPlayerMissing =
    match.fields.player1?.["en-US"] === undefined ||
    match.fields.player2?.["en-US"] === undefined;

  return {
    id: match.sys.id,
    name: match.fields.matchNumber["en-US"],
    nextMatchId: nextMatch?.sys.id ?? null,
    nextLooserMatchId: nextLoserMatch?.sys.id ?? null,
    tournamentRoundText: match.fields.round["en-US"],
    startTime: null,
    state: hasGameFinished
      ? isPlayerMissing
        ? "WALK_OVER"
        : "DONE"
      : "NO_PARTY",
    participants: [
      match.fields.player1?.["en-US"],
      match.fields.player2?.["en-US"],
    ]
      .filter((playerLink): playerLink is Link<"Entry"> => !!playerLink)
      .map((playerLink, index) => {
        const player = players.find(
          (player) => player.sys.id === playerLink!.sys.id
        );
        return {
          id: player!.sys.id,
          name: player!.fields.name["en-US"],
          status: null,
          // true: player 1 won, false: player 2 won, undefined: not played yet
          isWinner: match.fields.winner?.["en-US"]
            ? match.fields.winner["en-US"] === !Boolean(index)
            : undefined,
          resultText:
            match.fields.winner?.["en-US"] !== undefined
              ? index === 0
                ? `${setsWonByPlayer1}`
                : `${setsWonByPlayer2}`
              : undefined,
        };
      }),
  };
};

type MatchType = ReturnType<typeof toVisualMatch>;

export const createMatchesMap = (matches: MatchEntry[]): MatchesMap => {
  const matchesMap: MatchesMap = {
    upper: {},
    lower: {},
  };
  matches.forEach((match) => {
    const round = match.fields.round["en-US"];
    const isUpper = match.fields.isUpperBracket["en-US"];
    const bracket = isUpper ? matchesMap.upper : matchesMap.lower;
    if (!bracket[round]) {
      bracket[round] = {};
    }
    bracket[round][match.fields.roundMatchIndex["en-US"]] = match;
  });
  return matchesMap;
};

export const DoubleElimininationTree = ({
  tournament,
  matches,
  players,
}: DoubleElimininationTreeProps) => {
  const sdk = useSDK<PageAppSDK>();
  const { tournamentId } = useParams();
  const queryClient = useQueryClient();
  const tournamentMatches = tournament.fields.matches["en-US"]
    .map((matchLink) =>
      matches.find((match) => match.sys.id === matchLink.sys.id)
    )
    .filter((match): match is MatchEntry => !!match);
  const tournamentMatchesMap = createMatchesMap(tournamentMatches);

  const upperBracketMatches = tournamentMatches
    .filter((match) => match.fields.isUpperBracket["en-US"])
    .map((match) => toVisualMatch(match, players, tournamentMatchesMap));

  const lowerBracketMatches = tournamentMatches
    .filter((match) => !match.fields.isUpperBracket["en-US"])
    .map((match) => toVisualMatch(match, players, tournamentMatchesMap));

  const bracketMatches = {
    upper: upperBracketMatches,
    lower: lowerBracketMatches,
  };

  const openMatch = async ({ match }: { match: MatchType }) => {
    if (!match.id) return;
    const matchVersion = matches.find((m) => m.sys.id === match.id)?.sys
      .version;
    const { entity: updatedMatch } = await sdk.navigator.openEntry<
      MatchEntry["fields"]
    >(match.id, {
      slideIn: {
        waitForClose: true,
      },
    });
    if (updatedMatch && updatedMatch?.sys.version !== matchVersion) {
      const nextMatch = matches.find((m) => m.sys.id === match.nextMatchId);
      const nextLooserMatch = matches.find(
        (m) => m.sys.id === match.nextLooserMatchId
      );
      const winner = updatedMatch.fields.winner?.["en-US"];
      if (winner !== undefined) {
        const winnerPlayerId = winner
          ? updatedMatch.fields.player1?.["en-US"]
          : updatedMatch.fields.player2?.["en-US"];
        const looserPlayerId = winner
          ? updatedMatch.fields.player2?.["en-US"]
          : updatedMatch.fields.player1?.["en-US"];
        if (nextMatch) {
          if (!nextMatch.fields.player1?.["en-US"]) {
            nextMatch.fields.player1 = { "en-US": winnerPlayerId };
          } else if (!nextMatch.fields.player2?.["en-US"]) {
            nextMatch.fields.player2 = { "en-US": winnerPlayerId };
          }
          await sdk.cma.entry.update({ entryId: nextMatch.sys.id }, nextMatch);
        }
        if (nextLooserMatch) {
          if (!nextLooserMatch.fields.player1?.["en-US"]) {
            nextLooserMatch.fields.player1 = { "en-US": looserPlayerId };
          } else if (!nextLooserMatch.fields.player2?.["en-US"]) {
            nextLooserMatch.fields.player2 = { "en-US": looserPlayerId };
          }
          await sdk.cma.entry.update(
            { entryId: nextLooserMatch.sys.id },
            nextLooserMatch
          );
        }
      }
      queryClient.invalidateQueries(["tournaments", tournamentId, "matches"]);
    }
  };

  const openParty = async (party: { id: string }) => {
    if (!party.id) return;
    const partyVersion = players.find((p) => p.sys.id === party.id)?.sys
      .version;
    const { entity: updatedParty } = await sdk.navigator.openEntry<
      PlayerEntry["fields"]
    >(party.id, {
      slideIn: {
        waitForClose: true,
      },
    });
    if (updatedParty && updatedParty?.sys.version !== partyVersion) {
      queryClient.invalidateQueries(["players"]);
    }
  };

  // TODO: Text color player #c0c3c8

  const wrapperRef = useRef<HTMLDivElement>(null);
  const wrapperSize = useComponentSize(wrapperRef);

  // FIXME: Bug in library: https://github.com/g-loot/react-tournament-brackets/issues/77
  return (
    <div ref={wrapperRef} style={{ width: "100%", minHeight: "600px" }}>
      <DoubleEliminationBracket
        matches={bracketMatches}
        matchComponent={MatchComponent}
        onMatchClick={openMatch}
        onPartyClick={openParty}
        svgWrapper={({ children, ...props }: any) => {
          if (tournament.fields.players["en-US"].length <= 4) {
            return <>{children}</>;
          } else {
            return (
              <SVGViewer
                background={WhiteTheme.svgBackground}
                SVGBackground={WhiteTheme.svgBackground}
                width={wrapperSize.width}
                height={wrapperSize.height}
                {...props}
              >
                {children}
              </SVGViewer>
            );
          }
        }}
        theme={WhiteTheme}
        options={
          {
            style: {
              spaceBetweenColumns: 10,
              spaceBetweenRows: 10,
              roundHeader: {
                backgroundColor: WhiteTheme.roundHeader.backgroundColor,
                fontColor: WhiteTheme.roundHeader.fontColor,
              },
              connectorColor: WhiteTheme.connectorColor,
              connectorColorHighlight: WhiteTheme.connectorColorHighlight,
            },
          } as typeof OptionsType
        }
      />
    </div>
  );
};
