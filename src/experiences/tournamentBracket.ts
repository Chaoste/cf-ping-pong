import type {
  MatchType as VisualMatch,
  ParticipantType,
} from "@g-loot/react-tournament-brackets";
import {
  isWalkover,
  playerName,
  type TournamentMatch,
  type TournamentParticipant,
} from "./tournamentStatus";

type IndexedTournamentMatch = {
  id: string;
  match: TournamentMatch;
};

type MatchesByRound = Record<number, Record<number, IndexedTournamentMatch>>;

type TournamentMatchesMap = {
  lower: MatchesByRound;
  upper: MatchesByRound;
};

export type DoubleEliminationMatches = {
  lower: VisualMatch[];
  upper: VisualMatch[];
};

const isUpperBracket = (match: TournamentMatch) =>
  match.isUpperBracket === true;

const matchId = (match: TournamentMatch, position: number) =>
  match.matchNumber ??
  `${isUpperBracket(match) ? "upper" : "lower"}-${match.round ?? 0}-${match.roundMatchIndex ?? position + 1}`;

const toMatchesMap = (
  matches: IndexedTournamentMatch[],
): TournamentMatchesMap => {
  const matchesMap: TournamentMatchesMap = { lower: {}, upper: {} };

  for (const match of matches) {
    const bracket = isUpperBracket(match.match)
      ? matchesMap.upper
      : matchesMap.lower;
    const round = match.match.round ?? 0;
    const roundMatchIndex = match.match.roundMatchIndex ?? 0;

    bracket[round] ??= {};
    bracket[round][roundMatchIndex] = match;
  }

  return matchesMap;
};

const countSetsWon = (match: TournamentMatch): [number, number] =>
  [match.resultSet1, match.resultSet2, match.resultSet3].reduce<
    [number, number]
  >(
    ([firstPlayerWins, secondPlayerWins], result) => {
      if (!result) {
        return [firstPlayerWins, secondPlayerWins];
      }

      const [firstPlayerScore, secondPlayerScore] = result
        .split("-")
        .map(Number);
      if (
        !Number.isFinite(firstPlayerScore) ||
        !Number.isFinite(secondPlayerScore) ||
        firstPlayerScore === secondPlayerScore
      ) {
        return [firstPlayerWins, secondPlayerWins];
      }

      return firstPlayerScore > secondPlayerScore
        ? [firstPlayerWins + 1, secondPlayerWins]
        : [firstPlayerWins, secondPlayerWins + 1];
    },
    [0, 0],
  );

const bracketPlayerName = (
  player: TournamentParticipant | null | undefined,
  match: TournamentMatch,
) => {
  if (!player?.name && isWalkover(match)) {
    return "No opponent — match skipped";
  }

  return playerName(player);
};

const toParticipant = (
  match: TournamentMatch,
  matchId: string,
  player: TournamentParticipant | null | undefined,
  position: 0 | 1,
  setsWon: [number, number],
): ParticipantType => {
  const hasWinner = typeof match.winner === "boolean";

  return {
    id: `${matchId}-${position + 1}`,
    name: bracketPlayerName(player, match),
    profilePictureUrl: player?.profilePictureUrl ?? null,
    status: null,
    ...(hasWinner && {
      isWinner: position === 0 ? match.winner === true : match.winner === false,
      resultText: String(setsWon[position]),
    }),
  };
};

const lastUpperRound = (matchesMap: TournamentMatchesMap) =>
  Math.max(0, ...Object.keys(matchesMap.upper).map(Number));

const nextMatches = (
  indexedMatch: IndexedTournamentMatch,
  matchesMap: TournamentMatchesMap,
) => {
  const { match } = indexedMatch;
  const round = match.round;
  const roundMatchIndex = match.roundMatchIndex;

  if (typeof round !== "number" || typeof roundMatchIndex !== "number") {
    return {};
  }

  const isUpper = isUpperBracket(match);
  const bracket = isUpper ? matchesMap.upper : matchesMap.lower;
  const nextRoundMatchIndex =
    isUpper || round % 2 === 0
      ? Math.ceil(roundMatchIndex / 2)
      : roundMatchIndex;
  let nextMatch = bracket[round + 1]?.[nextRoundMatchIndex];

  if (!isUpper && !nextMatch) {
    nextMatch = matchesMap.upper[lastUpperRound(matchesMap)]?.[1];
  }

  let nextLoserMatch: IndexedTournamentMatch | undefined;
  if (isUpper && !match.matchNumber?.startsWith("Final")) {
    const nextLoserMatchRound = Math.max(1, 2 * (round - 1));
    const lowerRound = matchesMap.lower[nextLoserMatchRound];
    const lowerRoundMatchCount = Object.keys(lowerRound ?? {}).length;
    const nextLoserMatchRoundIndex =
      round === 1
        ? Math.ceil(roundMatchIndex / 2)
        : round % 2 === 0
          ? lowerRoundMatchCount - roundMatchIndex + 1
          : roundMatchIndex;
    nextLoserMatch = lowerRound?.[nextLoserMatchRoundIndex];
  }

  return {
    ...(nextMatch && { nextMatchId: nextMatch.id }),
    ...(nextLoserMatch && { nextLooserMatchId: nextLoserMatch.id }),
  };
};

const toVisualMatch = (
  indexedMatch: IndexedTournamentMatch,
  matchesMap: TournamentMatchesMap,
): VisualMatch => {
  const { id, match } = indexedMatch;
  const hasFinished = typeof match.winner === "boolean";
  const hasMissingPlayer = !match.player1?.name || !match.player2?.name;
  const setsWon = countSetsWon(match);

  return {
    id,
    name: match.matchNumber ?? "Match",
    nextMatchId: null,
    startTime: "",
    state: hasFinished ? (hasMissingPlayer ? "WALK_OVER" : "DONE") : "NO_PARTY",
    tournamentRoundText: String(match.round ?? ""),
    participants: [
      toParticipant(match, id, match.player1, 0, setsWon),
      toParticipant(match, id, match.player2, 1, setsWon),
    ],
    ...nextMatches(indexedMatch, matchesMap),
  };
};

const sortByRound = (
  left: IndexedTournamentMatch,
  right: IndexedTournamentMatch,
) =>
  (left.match.round ?? 0) - (right.match.round ?? 0) ||
  (left.match.roundMatchIndex ?? 0) - (right.match.roundMatchIndex ?? 0);

export const toDoubleEliminationMatches = (
  matches: TournamentMatch[],
): DoubleEliminationMatches => {
  const indexedMatches = matches.map((match, position) => ({
    id: matchId(match, position),
    match,
  }));
  const matchesMap = toMatchesMap(indexedMatches);
  const upper = indexedMatches
    .filter(({ match }) => isUpperBracket(match))
    .sort(sortByRound);
  const lower = indexedMatches
    .filter(({ match }) => !isUpperBracket(match))
    .sort(sortByRound);

  return {
    upper: upper.map((match) => toVisualMatch(match, matchesMap)),
    lower: lower.map((match) => toVisualMatch(match, matchesMap)),
  };
};
