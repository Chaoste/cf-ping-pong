import { createMatchTree } from "./createMatchTree";

describe("createMatchTree", () => {
  it("should create a match tree for two players", () => {
    const firstMatches = [["id1", "id2"]] as [string, string][];
    const matchTree = createMatchTree(firstMatches);
    expect(matchTree).toEqual([
      {
        matchNumber: "UB 1.1",
        round: 1,
        isUpperBracket: true,
        player1: {
          sys: {
            type: "Link",
            linkType: "Entry",
            id: "id1",
          },
        },
        player2: {
          sys: {
            type: "Link",
            linkType: "Entry",
            id: "id2",
          },
        },
      },
      {
        matchNumber: "Final",
        round: 2,
        isUpperBracket: true,
      },
    ]);
  });

  it("should create a match tree for four players", () => {
    const firstMatches = [
      ["id1", "id2"],
      ["id3", "id4"],
    ] as [string, string][];
    const matchTree = createMatchTree(firstMatches);
    expect(matchTree).toEqual([
      {
        matchNumber: "UB 1.1",
        round: 1,
        isUpperBracket: true,
        player1: {
          sys: {
            type: "Link",
            linkType: "Entry",
            id: "id1",
          },
        },
        player2: {
          sys: {
            type: "Link",
            linkType: "Entry",
            id: "id2",
          },
        },
      },
      {
        matchNumber: "UB 1.2",
        round: 1,
        isUpperBracket: true,
        player1: {
          sys: {
            type: "Link",
            linkType: "Entry",
            id: "id3",
          },
        },
        player2: {
          sys: {
            type: "Link",
            linkType: "Entry",
            id: "id4",
          },
        },
      },
      {
        matchNumber: "UB 2.1",
        round: 2,
        isUpperBracket: true,
      },
      {
        matchNumber: "LB 1.1",
        round: 1,
        isUpperBracket: false,
      },
      {
        matchNumber: "LB 2.1",
        round: 2,
        isUpperBracket: false,
      },
      {
        matchNumber: "Final",
        round: 3,
        isUpperBracket: true,
      },
    ]);
  });

  it("should create a match tree for six players", () => {
    const firstMatches = [
      ["id1", "id2"],
      ["id3", "id4"],
      ["id5", null],
      ["id6", null],
    ] as [string, string | null][];
    const matchTree = createMatchTree(firstMatches);
    expect(matchTree).toEqual([
      {
        matchNumber: "UB 1.1",
        round: 1,
        isUpperBracket: true,
        player1: {
          sys: {
            type: "Link",
            linkType: "Entry",
            id: "id1",
          },
        },
        player2: {
          sys: {
            type: "Link",
            linkType: "Entry",
            id: "id2",
          },
        },
      },
      {
        matchNumber: "UB 1.2",
        round: 1,
        isUpperBracket: true,
        player1: {
          sys: {
            type: "Link",
            linkType: "Entry",
            id: "id3",
          },
        },
        player2: {
          sys: {
            type: "Link",
            linkType: "Entry",
            id: "id4",
          },
        },
      },
      {
        matchNumber: "UB 1.3",
        round: 1,
        isUpperBracket: true,
        player1: {
          sys: {
            type: "Link",
            linkType: "Entry",
            id: "id5",
          },
        },
        player2: undefined,
      },
      {
        matchNumber: "UB 1.4",
        round: 1,
        isUpperBracket: true,
        player1: {
          sys: {
            type: "Link",
            linkType: "Entry",
            id: "id6",
          },
        },
        player2: undefined,
      },
      {
        matchNumber: "UB 2.1",
        round: 2,
        isUpperBracket: true,
      },
      {
        matchNumber: "UB 2.2",
        round: 2,
        isUpperBracket: true,
      },
      {
        matchNumber: "UB 3.1",
        round: 3,
        isUpperBracket: true,
      },
      {
        matchNumber: "LB 1.1",
        round: 1,
        isUpperBracket: false,
      },
      {
        matchNumber: "LB 1.2",
        round: 1,
        isUpperBracket: false,
      },
      {
        matchNumber: "LB 2.1",
        round: 2,
        isUpperBracket: false,
      },
      {
        matchNumber: "LB 2.2",
        round: 2,
        isUpperBracket: false,
      },
      {
        matchNumber: "LB 3.1",
        round: 3,
        isUpperBracket: false,
      },
      {
        matchNumber: "LB 4.1",
        round: 4,
        isUpperBracket: false,
      },
      {
        matchNumber: "Final",
        round: 4,
        isUpperBracket: true,
      },
    ]);
  });
});
