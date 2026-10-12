import {
  getNextMatch,
  isPlayedMatch,
  isReadyMatch,
  isWalkover,
  TournamentMatch,
} from "./tournamentStatus";

const createMatch = (
  overrides: Partial<TournamentMatch> = {}
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
});
