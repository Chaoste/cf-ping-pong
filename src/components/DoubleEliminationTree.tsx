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

const toVisualMatch = (match: MatchEntry, players: PlayerEntry[]) => {
  return {
    id: match.sys.id,
    name: match.fields.matchNumber["en-US"],
    nextMatchId: null, // TODO:
    nextLooserMatchId: null, // TODO:
    tournamentRoundText: match.fields.round["en-US"],
    startTime: "00:00",
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

  const upperBracketMatches = tournamentMatches
    .filter((match) => match.fields.isUpperBracket["en-US"])
    .map((match) => toVisualMatch(match, players));

  const lowerBracketMatches = tournamentMatches
    .filter((match) => !match.fields.isUpperBracket["en-US"])
    .map((match) => toVisualMatch(match, players));

  const bracketMatches = {
    upper: upperBracketMatches,
    lower: lowerBracketMatches,
  };
  return (
    <DoubleEliminationBracket
      matches={bracketMatches}
      matchComponent={MatchComponent}
      // currentRound={1}
      // onMatchClick={(match) => console.log(match)}
      // onPartyClick={(party) => console.log(party)}
      // theme, options
      svgWrapper={({ children, ...props }: any) => (
        <SVGViewer width={500} height={500} {...props}>
          {children}
        </SVGViewer>
      )}
    />
  );
};
