import { Link } from "contentful-management";

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
  player1: Link<"Entry">;
  player2?: Link<"Entry">;
  resultSet1?: `${number} - ${number}`;
  resultSet2?: `${number} - ${number}`;
  resultSet3?: `${number} - ${number}`;
  winner?: boolean;
};
