export type TournamentPlayer = {
  name?: string | null;
};

export type TournamentMatch = {
  completedAt?: string | null;
  isUpperBracket?: boolean | null;
  matchNumber?: string | null;
  player1?: TournamentPlayer | null;
  player2?: TournamentPlayer | null;
  resultSet1?: string | null;
  resultSet2?: string | null;
  resultSet3?: string | null;
  round?: number | null;
  roundMatchIndex?: number | null;
  winner?: boolean | null;
};

export type TournamentData = {
  matches?: TournamentMatch[] | null;
  name?: string | null;
  players?: TournamentPlayer[] | null;
};

export type TournamentAssemblyData = {
  matches?: unknown;
  players?: unknown;
  tournamentName?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const nullableString = (value: unknown) =>
  typeof value === "string" ? value : null;

const nullableNumber = (value: unknown) =>
  typeof value === "number" ? value : null;

const nullableBoolean = (value: unknown) =>
  typeof value === "boolean" ? value : null;

const toPlayer = (value: unknown): TournamentPlayer | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  return { name: nullableString(value.name) };
};

const toMatch = (value: unknown): TournamentMatch | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  return {
    completedAt: nullableString(value.completedAt),
    isUpperBracket: nullableBoolean(value.isUpperBracket),
    matchNumber: nullableString(value.matchNumber),
    player1: { name: nullableString(value.player1Name) },
    player2: { name: nullableString(value.player2Name) },
    resultSet1: nullableString(value.resultSet1),
    resultSet2: nullableString(value.resultSet2),
    resultSet3: nullableString(value.resultSet3),
    round: nullableNumber(value.round),
    roundMatchIndex: nullableNumber(value.roundMatchIndex),
    winner: nullableBoolean(value.winner),
  };
};

export const toTournamentData = (
  data: TournamentAssemblyData,
): TournamentData | undefined => {
  if (Object.values(data).every((value) => value === undefined)) {
    return undefined;
  }

  return {
    matches: Array.isArray(data.matches)
      ? data.matches
          .map(toMatch)
          .filter((match): match is TournamentMatch => match !== undefined)
      : [],
    name: nullableString(data.tournamentName),
    players: Array.isArray(data.players)
      ? data.players
          .map(toPlayer)
          .filter((player): player is TournamentPlayer => player !== undefined)
      : [],
  };
};

export const playerName = (player: TournamentPlayer | null | undefined) =>
  player?.name ?? "TBD";

export const isReadyMatch = (match: TournamentMatch) =>
  !!match.player1?.name && !!match.player2?.name && match.winner === null;

export const isWalkover = (match: TournamentMatch) =>
  typeof match.winner === "boolean" &&
  (!match.player1?.name || !match.player2?.name);

export const isPlayedMatch = (match: TournamentMatch) =>
  typeof match.winner === "boolean" && !isWalkover(match);

const matchPriority = (left: TournamentMatch, right: TournamentMatch) => {
  const leftRound = left.round ?? Number.MAX_SAFE_INTEGER;
  const rightRound = right.round ?? Number.MAX_SAFE_INTEGER;
  if (leftRound !== rightRound) {
    return leftRound - rightRound;
  }
  if (left.isUpperBracket !== right.isUpperBracket) {
    return left.isUpperBracket ? -1 : 1;
  }
  return (left.roundMatchIndex ?? 0) - (right.roundMatchIndex ?? 0);
};

export const getReadyMatches = (matches: TournamentMatch[]) =>
  matches.filter(isReadyMatch).sort(matchPriority);

export const getNextMatch = (matches: TournamentMatch[]) =>
  getReadyMatches(matches)[0];

export const getCurrentResults = (matches: TournamentMatch[]) =>
  matches
    .filter((match) => isPlayedMatch(match) || isWalkover(match))
    .sort((left, right) => {
      const leftCompletedAt =
        Date.parse(left.completedAt ?? "") || Number.NEGATIVE_INFINITY;
      const rightCompletedAt =
        Date.parse(right.completedAt ?? "") || Number.NEGATIVE_INFINITY;
      return rightCompletedAt - leftCompletedAt;
    });

export const winnerName = (match: TournamentMatch) =>
  match.winner === true ? playerName(match.player1) : playerName(match.player2);

export const score = (match: TournamentMatch) =>
  [match.resultSet1, match.resultSet2, match.resultSet3]
    .filter(
      (result): result is string =>
        typeof result === "string" && result.length > 0,
    )
    .join(", ");
