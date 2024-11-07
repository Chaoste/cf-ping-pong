import React from "react";
import { Multiselect } from "@contentful/f36-multiselect";
import { useQuery } from "react-query";
import { useSDK } from "@contentful/react-apps-toolkit";
import { useController } from "react-hook-form";
import { CreateTournamentFormFields } from "../types";

export const PlayersMultiselect = () => {
  const sdk = useSDK();
  const { data: players, isLoading } = useQuery("players", {
    queryFn: () => sdk.cma.entry.getMany({ query: { content_type: "player" } }),
  });

  const {
    field: { onChange, onBlur, ref: inputRef, value: selectedPlayerIds },
  } = useController<CreateTournamentFormFields, "players">({
    name: "players",
    defaultValue: [],
    rules: { required: true },
  });

  const togglePlayer = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!players) return;
    const { checked, value } = event.target;
    if (checked) {
      onChange([...selectedPlayerIds, value]);
    } else {
      onChange(selectedPlayerIds.filter((id: string) => id !== value));
    }
  };

  const toggleAll = (event: any) => {
    const { checked } = event.target;
    if (checked) {
      onChange(players?.items.map((player) => player.sys.id) || []);
    } else {
      onChange([]);
    }
  };

  const areAllSelected = React.useMemo(() => {
    return players?.items.every((element) =>
      selectedPlayerIds.includes(element.sys.id)
    );
  }, [players?.items, selectedPlayerIds]);

  const selectedPlayerLabels = React.useMemo(
    () =>
      selectedPlayerIds.map((id: string) => {
        const player = players?.items.find((player) => player.sys.id === id);
        return player?.fields.name["en-US"] || "";
      }),
    [players?.items, selectedPlayerIds]
  );

  return (
    <Multiselect
      currentSelection={selectedPlayerLabels}
      isLoading={isLoading}
      onBlur={onBlur}
      ref={inputRef}
      placeholder="Select players"
      noMatchesMessage="No players found"
    >
      <Multiselect.SelectAll
        onSelectItem={toggleAll}
        isChecked={areAllSelected}
      />
      {players?.items.map((player) => (
        <Multiselect.Option
          key={player.sys.id}
          value={player.sys.id}
          itemId={player.sys.id}
          isChecked={selectedPlayerIds.includes(player.sys.id)}
          label={player.fields.name["en-US"]}
          onSelectItem={togglePlayer}
        />
      ))}
    </Multiselect>
  );
};
