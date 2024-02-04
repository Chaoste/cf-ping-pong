import React from "react";
import {
  DoubleEliminationBracket,
  Match as MatchComponent,
  SVGViewer,
  // @ts-ignore
} from "@g-loot/react-tournament-brackets";
import { MatchEntry, PlayerEntry, TournamentEntry } from "../types";
import { Link } from "contentful-management";

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
  let nextMatch =
    bracket[match.fields.round["en-US"] + 1]?.[nextRoundMatchIndex];
  if (!isUpper && !nextMatch) {
    const lastRound = Object.keys(matchesMap.upper).length;
    // The last lower bracket match points again to the final in the upper bracket at the end
    nextMatch = matchesMap.upper[lastRound]?.[1];
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

  return {
    id: match.sys.id,
    name: match.fields.matchNumber["en-US"],
    nextMatchId: nextMatch?.sys.id ?? null,
    nextLooserMatchId: nextLoserMatch?.sys.id ?? null,
    tournamentRoundText: match.fields.round["en-US"],
    startTime: null,
    state: null,
    // TODO: href
    participants: [
      match.fields.player1?.["en-US"],
      match.fields.player2?.["en-US"],
    ]
      .filter((playerLink): playerLink is Link<"Entry"> => !!playerLink)
      .map((playerLink) => {
        const player = players.find(
          (player) => player.sys.id === playerLink!.sys.id
        );
        return {
          id: player!.sys.id,
          name: player!.fields.name["en-US"],
          status: null,
          // TODO: isWinner, resultText
        };
      }),
  };
};

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

  // TODO: Text color player #c0c3c8

  return (
    <DoubleEliminationBracket
      matches={bracketMatches}
      matchComponent={MatchComponent}
      // currentRound={1}
      // onMatchClick={(match) => console.log(match)}
      // onPartyClick={(party) => console.log(party)}
      // theme, options
      svgWrapper={({ children, ...props }: any) => {
        if (tournament.fields.players["en-US"].length <= 4) {
          return <>{children}</>;
        } else {
          return (
            <SVGViewer width={1000} height={1000} {...props}>
              {children}
            </SVGViewer>
          );
        }
      }}
    />
  );
};
