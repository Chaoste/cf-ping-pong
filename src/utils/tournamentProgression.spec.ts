import { MatchEntry } from "../types";
import { recordMatchResult } from "./recordMatchResult";
import { getMatchProgressionTargets, getMatchProgressionUpdates } from "./tournamentProgression";

const link = (id: string) => ({
  sys: { type: "Link" as const, linkType: "Entry" as const, id },
});

const match = (
  id: string,
  fields: Partial<MatchEntry["fields"]>,
) =>
  ({
    sys: { id, version: 1 },
    fields: {
      isUpperBracket: { "en-US": true },
      matchNumber: { "en-US": id },
      player1: { "en-US": undefined },
      player2: { "en-US": undefined },
      round: { "en-US": 1 },
      roundMatchIndex: { "en-US": 1 },
      winner: { "en-US": undefined },
      ...fields,
    },
  } as MatchEntry);

describe("tournament progression", () => {
  it("places a reported winner and loser in their next empty matches", () => {
    const completed = match("UB 1.1", {
      player1: { "en-US": link("ada") },
      player2: { "en-US": link("grace") },
      winner: { "en-US": true },
    });
    const upperNext = match("UB 2.1", {
      round: { "en-US": 2 },
      player1: { "en-US": link("lin") },
    });
    const lowerNext = match("LB 1.1", {
      isUpperBracket: { "en-US": false },
    });

    expect(getMatchProgressionTargets(completed, [completed, upperNext, lowerNext])).toEqual({
      nextMatch: upperNext,
      nextLoserMatch: lowerNext,
    });
    expect(getMatchProgressionUpdates(completed, [completed, upperNext, lowerNext])).toEqual([
      expect.objectContaining({
        sys: upperNext.sys,
        fields: expect.objectContaining({ player2: { "en-US": link("ada") } }),
      }),
      expect.objectContaining({
        sys: lowerNext.sys,
        fields: expect.objectContaining({ player1: { "en-US": link("grace") } }),
      }),
    ]);
  });

  it("does not overwrite a successor or duplicate an already advanced player", () => {
    const completed = match("UB 1.1", {
      player1: { "en-US": link("ada") },
      player2: { "en-US": link("grace") },
      winner: { "en-US": true },
    });
    const upperNext = match("UB 2.1", {
      round: { "en-US": 2 },
      player1: { "en-US": link("ada") },
      player2: { "en-US": link("lin") },
    });
    const lowerNext = match("LB 1.1", {
      isUpperBracket: { "en-US": false },
      player1: { "en-US": link("margaret") },
      player2: { "en-US": link("katherine") },
    });

    expect(getMatchProgressionUpdates(completed, [completed, upperNext, lowerNext])).toEqual([]);
  });

  it("persists a result before advancing its players", async () => {
    const unfinished = match("UB 1.1", {
      player1: { "en-US": link("ada") },
      player2: { "en-US": link("grace") },
    });
    const upperNext = match("UB 2.1", { round: { "en-US": 2 } });
    const lowerNext = match("LB 1.1", {
      isUpperBracket: { "en-US": false },
    });
    const updateMatch = jest.fn(async (entry: MatchEntry) => entry);

    await recordMatchResult({
      match: unfinished,
      matches: [unfinished, upperNext, lowerNext],
      result: { resultSet1: "11 - 8", winner: true },
      updateMatch,
    });

    expect(updateMatch).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        sys: unfinished.sys,
        fields: expect.objectContaining({
          resultSet1: { "en-US": "11 - 8" },
          winner: { "en-US": true },
        }),
      }),
    );
    expect(updateMatch).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        sys: upperNext.sys,
        fields: expect.objectContaining({ player1: { "en-US": link("ada") } }),
      }),
    );
    expect(updateMatch).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        sys: lowerNext.sys,
        fields: expect.objectContaining({ player1: { "en-US": link("grace") } }),
      }),
    );
  });
});
