import React, { useCallback, useEffect } from "react";
import { useController, useWatch } from "react-hook-form";
import { CreateTournamentFormFields } from "../types";
import { Button } from "@contentful/f36-components";
import { CycleIcon } from "@contentful/f36-icons";
import { useSDK } from "@contentful/react-apps-toolkit";
import { useQuery } from "react-query";

const isPowerOfTwo = (aNumber: number) => {
  return aNumber >= 2 && (aNumber & (aNumber - 1)) === 0;
};

// Src: https://www.techiedelight.com/round-previous-power-2/
const getPreviousPowerOfTwo = (aNumber: number) => {
  if (isPowerOfTwo(aNumber)) {
    return aNumber / 2;
  }
  // set all bits after the last set bit
  aNumber = aNumber | (aNumber >> 1);
  aNumber = aNumber | (aNumber >> 2);
  aNumber = aNumber | (aNumber >> 4);
  aNumber = aNumber | (aNumber >> 8);
  aNumber = aNumber | (aNumber >> 16);

  // drop all but the last set bit from `n`
  return aNumber - (aNumber >> 1);
};

export const PreviewMatches = () => {
  const sdk = useSDK();
  const { data: players, isLoading } = useQuery("players", {
    queryFn: () => sdk.cma.entry.getMany({ query: { content_type: "player" } }),
  });

  const playerIds = useWatch<CreateTournamentFormFields, "players">({
    name: "players",
  });

  const {
    field: { onChange, value: matches },
  } = useController<CreateTournamentFormFields, "matches">({
    name: "matches",
    defaultValue: [],
    rules: { required: true },
  });

  const createRandomMatches = useCallback(() => {
    if (!playerIds || playerIds.length < 2) {
      onChange([]);
      return;
    }

    const amountPlayers = playerIds.length;
    const amount1stRoundMatches = getPreviousPowerOfTwo(amountPlayers);
    // const amountAllMatches = amount1stRoundMatches * 2 - 1;
    // const amountRounds = Math.log(amountAllMatches) / Math.log(2);
    const shuffledPlayers = playerIds.sort(() => Math.random() - 0.5);

    const skippedMatches = amount1stRoundMatches * 2 - amountPlayers;
    const activePlayers = shuffledPlayers.slice(
      0,
      amountPlayers - skippedMatches
    );
    const skippedPlayers = shuffledPlayers.slice(
      amountPlayers - skippedMatches
    );

    const newMatches: typeof matches = [];
    for (let i = 0; i < activePlayers.length; i += 2) {
      newMatches.push([playerIds[i], playerIds[i + 1]]);
    }

    if (skippedPlayers.length) {
      for (let i = 0; i < skippedPlayers.length; i++) {
        newMatches.push([skippedPlayers[i], null]);
      }
    }

    // Make sure that we create a new matching if possible
    if (
      JSON.stringify(newMatches) === JSON.stringify(matches) &&
      matches.length > 1
    ) {
      createRandomMatches();
      return;
    }

    onChange(newMatches);
  }, [matches, onChange, playerIds]);

  const getPlayerName = (id: string | null) => {
    if (id === null) {
      return "-";
    }
    const player = players?.items.find((player) => player.sys.id === id);
    return player?.fields.name["en-US"] || "<Unknown>";
  };

  useEffect(() => {
    createRandomMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerIds]);

  if (isLoading || !matches.length) {
    return <p>Not enough players selected</p>;
  }

  return (
    <>
      <ul>
        {matches.map((match, index) => (
          <li key={index}>
            {getPlayerName(match[0])} vs {getPlayerName(match[1])}
          </li>
        ))}
      </ul>
      <Button endIcon={<CycleIcon />} onClick={createRandomMatches}>
        Regenerate matchings
      </Button>
    </>
  );
};
