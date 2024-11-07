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
  }));

  // Add all remaining upper bracket matches
  let round = 2;
  let roundMatchIndex = 1;
  for (let i = firstMatches.length; i < amountAllUpperMatches; i++) {
    matches.push({
      matchNumber: `UB ${round}.${roundMatchIndex}`,
      round,
      roundMatchIndex,
      isUpperBracket: true,
    });
    roundMatchIndex++;
    if (roundMatchIndex > Math.pow(2, amountUpperRounds - round)) {
      round++;
      roundMatchIndex = 1;
    }
  }

  debugger;

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
