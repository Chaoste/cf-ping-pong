import { toDoubleEliminationMatches } from "./tournamentBracket";

describe("tournament bracket matches", () => {
  it("connects upper and lower bracket matches in their tournament progression", () => {
    const matches = toDoubleEliminationMatches([
      {
        matchNumber: "UB 1.1",
        isUpperBracket: true,
        round: 1,
        roundMatchIndex: 1,
        player1: {
          name: "Ada",
          profilePictureUrl: "https://images.example.com/ada.png",
        },
        player2: { name: "Grace" },
        winner: true,
      },
      {
        matchNumber: "UB 1.2",
        isUpperBracket: true,
        round: 1,
        roundMatchIndex: 2,
        player1: { name: "Lin" },
        player2: { name: "Margaret" },
        winner: null,
      },
      {
        matchNumber: "UB 2.1",
        isUpperBracket: true,
        round: 2,
        roundMatchIndex: 1,
        player1: null,
        player2: null,
        winner: null,
      },
      {
        matchNumber: "LB 1.1",
        isUpperBracket: false,
        round: 1,
        roundMatchIndex: 1,
        player1: null,
        player2: null,
        winner: null,
      },
    ]);

    expect(matches.upper).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "UB 1.1",
          nextMatchId: "UB 2.1",
          nextLooserMatchId: "LB 1.1",
          participants: [
            expect.objectContaining({
              profilePictureUrl: "https://images.example.com/ada.png",
            }),
            expect.any(Object),
          ],
        }),
      ]),
    );
    expect(matches.lower).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "LB 1.1", nextMatchId: "UB 2.1" }),
      ]),
    );
  });

  it("labels a concluded one-player match as a walkover", () => {
    const matches = toDoubleEliminationMatches([
      {
        matchNumber: "UB 1.1",
        isUpperBracket: true,
        round: 1,
        roundMatchIndex: 1,
        player1: { name: "Ada" },
        player2: null,
        winner: true,
      },
    ]);

    expect(matches.upper[0]).toMatchObject({
      state: "WALK_OVER",
      participants: [
        { name: "Ada", isWinner: true },
        { name: "No opponent — match skipped" },
      ],
    });
  });
});
