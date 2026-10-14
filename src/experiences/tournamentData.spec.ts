import {
  getCurrentResults,
  getNextMatch,
  getRegisteredPlayerCount,
  getReadyMatches,
  isPlayedMatch,
  isReadyMatch,
  isWalkover,
  toTournamentData,
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

  it("counts each participant once from the bracket", () => {
    expect(
      getRegisteredPlayerCount([
        createMatch(),
        createMatch({
          player1: { name: "Player 2" },
          player2: { name: "Player 3" },
        }),
        createMatch({ player1: null, player2: null }),
      ]),
    ).toBe(3);
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

  it("reconstructs the tournament name and matches from top-level assembly properties", () => {
    const data = toTournamentData({
      tournamentName: "Contentful Pong Cup",
      matches: [
        {
          matchNumber: "UB 1.1",
          player1Name: "Player 1",
          player1ProfilePictureUrl: "https://images.example.com/player-1.png",
          player2Name: "Player 2",
          round: 1,
          roundMatchIndex: 1,
          isUpperBracket: true,
        },
      ],
    });

    expect(data).toMatchObject({
      tournamentName: "Contentful Pong Cup",
      matches: [
        expect.objectContaining({
          matchNumber: "UB 1.1",
          player1: {
            name: "Player 1",
            profilePictureUrl: "https://images.example.com/player-1.png",
          },
        }),
      ],
    });
  });
});
