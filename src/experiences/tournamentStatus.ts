export type TournamentParticipant = {
  name?: string | null;
  profilePictureUrl?: string | null;
};

export type TournamentMatch = {
  completedAt?: string | null;
  isUpperBracket?: boolean | null;
  matchNumber?: string | null;
  player1?: TournamentParticipant | null;
  player2?: TournamentParticipant | null;
  resultSet1?: string | null;
  resultSet2?: string | null;
  resultSet3?: string | null;
  round?: number | null;
  roundMatchIndex?: number | null;
  winner?: boolean | null;
};

export type TournamentData = {
  tournamentName?: string | null;
  matches?: TournamentMatch[] | null;
};

export type TournamentAssemblyData = {
  tournamentName?: unknown;
  matches?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const nullableString = (value: unknown) =>
  typeof value === "string" ? value : null;

const nullableNumber = (value: unknown) =>
  typeof value === "number" ? value : null;

const nullableBoolean = (value: unknown) =>
  typeof value === "boolean" ? value : null;

const toMatch = (value: unknown): TournamentMatch | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  return {
    completedAt: nullableString(value.completedAt),
    isUpperBracket: nullableBoolean(value.isUpperBracket),
    matchNumber: nullableString(value.matchNumber),
    player1: {
      name: nullableString(value.player1Name),
      profilePictureUrl: nullableString(value.player1ProfilePictureUrl),
    },
    player2: {
      name: nullableString(value.player2Name),
      profilePictureUrl: nullableString(value.player2ProfilePictureUrl),
    },
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
    tournamentName: nullableString(data.tournamentName),
    matches: Array.isArray(data.matches)
      ? data.matches
          .map(toMatch)
          .filter((match): match is TournamentMatch => match !== undefined)
      : [],
  };
};

export const playerName = (player: TournamentParticipant | null | undefined) =>
  player?.name ?? "TBD";

export const getRegisteredPlayerCount = (matches: TournamentMatch[]) =>
  new Set(
    matches
      .flatMap((match) => [match.player1?.name, match.player2?.name])
      .filter((name): name is string => typeof name === "string"),
  ).size;

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
