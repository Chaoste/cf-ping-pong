import { Link } from "contentful-management";
import { Match } from "../types";

export const createMatchTree = (
  firstMatches: [string, string | null][]
): Match[] => {
  const assumedPlayersAmount = firstMatches.length * 2;
  const amountAllUpperMatches = assumedPlayersAmount - 1; // excl. Final
  const amountAllLowerMatches = assumedPlayersAmount - 2;
  const amountUpperRounds = Math.log(assumedPlayersAmount) / Math.log(2);
  const amountLowerRounds =
    2 * (Math.log(assumedPlayersAmount) / Math.log(2)) - 2;

  // Add matches of the first round of the upper bracket
  const matches: Match[] = firstMatches.map((match, index) => ({
    matchNumber: `UB 1.${index + 1}`,
    roundMatchIndex: index + 1,
    round: 1,
    isUpperBracket: true,
    player1: {
      sys: {
        type: "Link",
        linkType: "Entry",
        id: match[0],
      },
    },
    player2: match[1]
      ? {
          sys: {
            type: "Link",
            linkType: "Entry",
            id: match[1],
          },
        }
      : undefined,
    winner: !match[1] ? true : undefined,
  }));

  // Add all remaining upper bracket matches
  let round = 2;
  let roundMatchIndex = 1;
  for (let i = firstMatches.length; i < amountAllUpperMatches; i++) {
    let player1: Link<"Entry"> | undefined = undefined;
    let player2: Link<"Entry"> | undefined = undefined;
    const previousMatches = matches.filter(
      // eslint-disable-next-line no-loop-func
      (m) => m.isUpperBracket && m.round === round - 1
    );
    const previousMatch1 = previousMatches[(roundMatchIndex - 1) * 2];
    const previousMatch2 = previousMatches[(roundMatchIndex - 1) * 2 + 1];
    if (previousMatch1?.winner !== undefined) {
      player1 = previousMatch1.player1;
    }
    if (previousMatch2?.winner !== undefined) {
      player2 = previousMatch2.player1;
    }
    matches.push({
      matchNumber: `UB ${round}.${roundMatchIndex}`,
      round,
      roundMatchIndex,
      isUpperBracket: true,
      player1,
      player2,
    });
    roundMatchIndex++;
    if (roundMatchIndex > Math.pow(2, amountUpperRounds - round)) {
      round++;
      roundMatchIndex = 1;
    }
  }

  // Add all remaining lower bracket matches
  round = 1;
  roundMatchIndex = 1;
  for (let i = 0; i < amountAllLowerMatches; i++) {
    matches.push({
      matchNumber: `LB ${round}.${roundMatchIndex}`,
      round,
      roundMatchIndex,
      isUpperBracket: false,
    });
    roundMatchIndex++;
    const matchesPerRound = Math.pow(
      2,
      amountLowerRounds / 2 - Math.ceil(round / 2)
    );
    if (roundMatchIndex > matchesPerRound) {
      round++;
      roundMatchIndex = 1;
    }
  }

  // Add final match
  matches.push({
    matchNumber: "Final",
    round: amountUpperRounds + 1,
    roundMatchIndex: 1,
    isUpperBracket: true,
  });

  return matches;
};
