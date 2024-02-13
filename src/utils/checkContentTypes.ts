import { PageAppSDK } from "@contentful/app-sdk";
import { Match, Player, Tournament } from "../types";

type Fields<T> = Array<keyof T>;

export const checkContentTypeReady = async (
  sdk: PageAppSDK,
  contentTypeId: string,
  fields: string[]
) => {
  try {
    const contentType = await sdk.cma.contentType.get({
      contentTypeId,
    });
    return fields.every((key) =>
      contentType.fields.find((field) => field.id === key)
    );
  } catch {
    return false;
  }
};

export const checkTournamentReady = async (sdk: PageAppSDK) => {
  return checkContentTypeReady(sdk, "tournament", [
    "name",
    "players",
    "matches",
    "rounds",
  ] satisfies Fields<Tournament>);
};

export const checkPlayerReady = async (sdk: PageAppSDK) => {
  return checkContentTypeReady(sdk, "player", [
    "name",
    "profilePicture",
  ] satisfies Fields<Player>);
};

export const checkMatchReady = async (sdk: PageAppSDK) => {
  return checkContentTypeReady(sdk, "match", [
    "matchNumber",
    "isUpperBracket",
    "round",
    "roundMatchIndex",
    "player1",
    "player2",
    "resultSet1",
    "resultSet2",
    "resultSet3",
    "winner",
  ] satisfies Fields<Match>);
};

export const checkContentTypesReady = async (sdk: PageAppSDK) => {
  return (
    await Promise.all([
      checkTournamentReady(sdk),
      checkPlayerReady(sdk),
      checkMatchReady(sdk),
    ])
  ).every(Boolean);
};
