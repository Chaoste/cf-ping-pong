import { Link } from "contentful-management";
import { MatchEntry } from "../types";

type MatchesByRound = Record<number, Record<number, MatchEntry>>;

type MatchesMap = {
  upper: MatchesByRound;
  lower: MatchesByRound;
};

export type MatchProgressionTargets = {
  nextMatch?: MatchEntry;
  nextLoserMatch?: MatchEntry;
};

const playerLink = (match: MatchEntry, field: "player1" | "player2") =>
  match.fields[field]?.["en-US"];

export const createMatchesMap = (matches: MatchEntry[]): MatchesMap => {
  const matchesMap: MatchesMap = { upper: {}, lower: {} };

  for (const match of matches) {
    const round = match.fields.round?.["en-US"];
    const roundMatchIndex = match.fields.roundMatchIndex?.["en-US"];
    const isUpperBracket = match.fields.isUpperBracket?.["en-US"];

    if (
      typeof round !== "number" ||
      typeof roundMatchIndex !== "number" ||
      typeof isUpperBracket !== "boolean"
    ) {
      continue;
    }

    const bracket = isUpperBracket ? matchesMap.upper : matchesMap.lower;
    bracket[round] ??= {};
    bracket[round][roundMatchIndex] = match;
  }

  return matchesMap;
};

const lastUpperRound = (matchesMap: MatchesMap) =>
  Math.max(0, ...Object.keys(matchesMap.upper).map(Number));

export const getMatchProgressionTargets = (
  match: MatchEntry,
  matches: MatchEntry[],
): MatchProgressionTargets => {
  const round = match.fields.round?.["en-US"];
  const roundMatchIndex = match.fields.roundMatchIndex?.["en-US"];
  const isUpperBracket = match.fields.isUpperBracket?.["en-US"];

  if (
    typeof round !== "number" ||
    typeof roundMatchIndex !== "number" ||
    typeof isUpperBracket !== "boolean"
  ) {
    return {};
  }

  const matchesMap = createMatchesMap(matches);
  const bracket = isUpperBracket ? matchesMap.upper : matchesMap.lower;
  const nextRoundMatchIndex =
    isUpperBracket || round % 2 === 0
      ? Math.ceil(roundMatchIndex / 2)
      : roundMatchIndex;
  let nextMatch = bracket[round + 1]?.[nextRoundMatchIndex];

  if (!isUpperBracket && !nextMatch) {
    nextMatch = matchesMap.upper[lastUpperRound(matchesMap)]?.[1];
  }

  if (
    !isUpperBracket ||
    match.fields.matchNumber?.["en-US"]?.startsWith("Final")
  ) {
    return { nextMatch };
  }

  const nextLoserMatchRound = Math.max(1, 2 * (round - 1));
  const loserRound = matchesMap.lower[nextLoserMatchRound];
  const numberOfLoserMatches = Object.keys(loserRound ?? {}).length;
  const nextLoserMatchIndex =
    round === 1
      ? Math.ceil(roundMatchIndex / 2)
      : round % 2 === 0
      ? numberOfLoserMatches - roundMatchIndex + 1
      : roundMatchIndex;

  return {
    nextMatch,
    nextLoserMatch: loserRound?.[nextLoserMatchIndex],
  };
};

const withPlayer = (
  match: MatchEntry,
  player: Link<"Entry"> | undefined,
): MatchEntry | undefined => {
  if (!player) {
    return undefined;
  }

  const player1 = playerLink(match, "player1");
  const player2 = playerLink(match, "player2");

  if (player1?.sys.id === player.sys.id || player2?.sys.id === player.sys.id) {
    return undefined;
  }

  if (!player1) {
    return {
      ...match,
      fields: { ...match.fields, player1: { "en-US": player } },
    };
  }

  if (!player2) {
    return {
      ...match,
      fields: { ...match.fields, player2: { "en-US": player } },
    };
  }

  return undefined;
};

/**
 * Returns only the successor entries which need a player assignment. It never
 * replaces an existing player, so processing the same result is idempotent.
 */
export const getMatchProgressionUpdates = (
  completedMatch: MatchEntry,
  matches: MatchEntry[],
): MatchEntry[] => {
  const winner = completedMatch.fields.winner?.["en-US"];
  if (typeof winner !== "boolean") {
    return [];
  }

  const { nextMatch, nextLoserMatch } = getMatchProgressionTargets(
    completedMatch,
    matches,
  );
  const winningPlayer = playerLink(
    completedMatch,
    winner ? "player1" : "player2",
  );
  const losingPlayer = playerLink(
    completedMatch,
    winner ? "player2" : "player1",
  );

  return [
    nextMatch && withPlayer(nextMatch, winningPlayer),
    nextLoserMatch && withPlayer(nextLoserMatch, losingPlayer),
  ].filter((match): match is MatchEntry => match !== undefined);
};
