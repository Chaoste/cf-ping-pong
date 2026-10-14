import { MatchEntry } from "../types";
import { getMatchProgressionUpdates } from "./tournamentProgression";

export type MatchResult = {
  resultSet1?: string;
  resultSet2?: string;
  resultSet3?: string;
  winner: boolean;
};

export type RecordMatchResultOptions = {
  match: MatchEntry;
  matches: MatchEntry[];
  result: MatchResult;
  updateMatch: (match: MatchEntry) => Promise<MatchEntry>;
};

export type RecordedMatchResult = {
  match: MatchEntry;
  successors: MatchEntry[];
};

const currentTimestamp = () => new Date().toISOString();

const withResult = (match: MatchEntry, result: MatchResult): MatchEntry => ({
  ...match,
  fields: {
    ...match.fields,
    completedAt: { "en-US": currentTimestamp() },
    resultSet1: { "en-US": result.resultSet1 },
    resultSet2: { "en-US": result.resultSet2 },
    resultSet3: { "en-US": result.resultSet3 },
    winner: { "en-US": result.winner },
  },
});

export const recordMatchResult = async ({
  match,
  matches,
  result,
  updateMatch,
}: RecordMatchResultOptions): Promise<RecordedMatchResult> => {
  const savedMatch = await updateMatch(withResult(match, result));
  const successors = getMatchProgressionUpdates(savedMatch, matches);
  await Promise.all(successors.map((successor) => updateMatch(successor)));

  return { match: savedMatch, successors };
};
