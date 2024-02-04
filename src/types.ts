import { EntryProps, Link } from "contentful-management";

export type CreateTournamentFormFields = {
  name: string;
  players: string[];
  matches: [string, string | null][];
};

export type Tournament = {
  name: string;
  players: Link<"Entry">[];
  matches: Link<"Entry">[];
  rounds: number;
};

export type Player = {
  name: string;
  profilePicture: Link<"Asset">;
};

export type Match = {
  matchNumber: string;
  isUpperBracket: boolean;
  round: number;
  roundMatchIndex: number;
  player1?: Link<"Entry">;
  player2?: Link<"Entry">;
  resultSet1?: `${number} - ${number}`;
  resultSet2?: `${number} - ${number}`;
  resultSet3?: `${number} - ${number}`;
  winner?: boolean;
};

export type TournamentEntry = EntryProps<{
  [K in keyof Tournament]: { "en-US": Tournament[K] };
}>;
export type MatchEntry = EntryProps<{
  [K in keyof Match]: { "en-US": Match[K] };
}>;
export type PlayerEntry = EntryProps<{
  [K in keyof Player]: { "en-US": Player[K] };
}>;
