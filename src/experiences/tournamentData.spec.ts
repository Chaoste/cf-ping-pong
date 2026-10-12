import {
  getCurrentResults,
  getNextMatch,
  getReadyMatches,
  isPlayedMatch,
  isReadyMatch,
  isWalkover,
  TournamentMatch,
} from "./tournamentStatus";

const createMatch = (
  overrides: Partial<TournamentMatch> = {},
): TournamentMatch => ({
  matchNumber: "UB 1.1",
  isUpperBracket: true,
  round: 1,
  roundMatchIndex: 1,
  player1: { name: "Player 1" },
  player2: { name: "Player 2" },
  winner: null,
  ...overrides,
});

describe("tournament status helpers", () => {
  it("prioritizes the earliest ready upper-bracket match", () => {
    const nextMatch = getNextMatch([
      createMatch({ matchNumber: "lower", isUpperBracket: false }),
      createMatch({ matchNumber: "later", round: 2 }),
      createMatch({ matchNumber: "second", roundMatchIndex: 2 }),
      createMatch({ matchNumber: "first" }),
    ]);

    expect(nextMatch?.matchNumber).toBe("first");
    expect(
      getReadyMatches([
        createMatch({ matchNumber: "lower", isUpperBracket: false }),
        createMatch({ matchNumber: "later", round: 2 }),
        createMatch({ matchNumber: "second", roundMatchIndex: 2 }),
        nextMatch!,
      ]).map((match) => match.matchNumber),
    ).toEqual(["first", "second", "lower", "later"]);
  });

  it("keeps played matches, byes, and ready matches distinct", () => {
    const played = createMatch({ winner: true });
    const bye = createMatch({ player2: null, winner: true });
    const ready = createMatch();

    expect(isPlayedMatch(played)).toBe(true);
    expect(isWalkover(bye)).toBe(true);
    expect(isPlayedMatch(bye)).toBe(false);
    expect(isReadyMatch(ready)).toBe(true);
  });

  it("lists the most recently completed matches first", () => {
    const results = getCurrentResults([
      createMatch({
        matchNumber: "earlier",
        winner: true,
        completedAt: "2026-10-15T10:00:00Z",
      }),
      createMatch({
        matchNumber: "latest",
        winner: false,
        completedAt: "2026-10-15T11:00:00Z",
      }),
    ]);

    expect(results.map((match) => match.matchNumber)).toEqual([
      "latest",
      "earlier",
    ]);
  });
});
