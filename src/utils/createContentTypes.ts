import { PageAppSDK } from "@contentful/app-sdk";

export const createTournamentContentType = async (sdk: PageAppSDK) => {
  await sdk.cma.contentType.createWithId(
    { contentTypeId: "tournament" },
    {
      name: "Tournament",
      displayField: "name",
      fields: [
        {
          type: "Symbol",
          name: "Name",
          apiName: "name",
          id: "name",
          required: true,
          localized: false,
        },
        {
          type: "Array",
          items: {
            type: "Link",
            linkType: "Entry",
            validations: [
              {
                linkContentType: ["player"],
              },
            ],
          },
          name: "Players",
          apiName: "players",
          id: "players",
          required: false,
          localized: false,
        },
        {
          type: "Array",
          items: {
            type: "Link",
            linkType: "Entry",
            validations: [
              {
                linkContentType: ["match"],
              },
            ],
          },
          name: "Matches",
          apiName: "matches",
          id: "matches",
          required: false,
          localized: false,
        },
        {
          type: "Integer",
          name: "Rounds",
          apiName: "rounds",
          id: "rounds",
          required: true,
          localized: false,
        },
      ],
    }
  );
};

export const createMatchContentType = async (sdk: PageAppSDK) => {
  await sdk.cma.contentType.createWithId(
    { contentTypeId: "match" },
    {
      name: "Match",
      displayField: "matchNumber",
      fields: [
        {
          type: "Symbol",
          name: "Match Number",
          apiName: "matchNumber",
          id: "matchNumber",
          required: true,
          localized: false,
          validations: [
            {
              unique: true,
            },
            {
              regexp: {
                pattern: "\\d+",
                flags: "",
              },
            },
          ],
        },
        {
          type: "Boolean",
          name: "Is Upper Bracket",
          apiName: "isUpperBracket",
          id: "isUpperBracket",
          required: true,
          localized: false,
        },
        {
          type: "Integer",
          name: "Round",
          apiName: "round",
          id: "round",
          required: true,
          localized: false,
        },
        {
          type: "Integer",
          name: "Round Match Index",
          apiName: "roundMatchIndex",
          id: "roundMatchIndex",
          required: true,
          localized: false,
        },
        {
          type: "Link",
          name: "Player 1",
          apiName: "player1",
          id: "player1",
          required: false,
          localized: false,
          validations: [{ linkContentType: ["player"] }],
        },
        {
          type: "Link",
          name: "Player 2",
          apiName: "player2",
          id: "player2",
          required: false,
          localized: false,
          validations: [{ linkContentType: ["player"] }],
        },
        {
          type: "Symbol",
          name: "Result Set 1",
          apiName: "resultSet1",
          id: "resultSet1",
          required: false,
          localized: false,
          validations: [
            {
              regexp: {
                pattern: "\\d+ - \\d+",
                flags: "",
              },
            },
          ],
        },
        {
          type: "Symbol",
          name: "Result Set 2",
          apiName: "resultSet2",
          id: "resultSet2",
          required: false,
          localized: false,
          validations: [
            {
              regexp: {
                pattern: "\\d+ - \\d+",
                flags: "",
              },
            },
          ],
        },
        {
          type: "Symbol",
          name: "Result Set 3",
          apiName: "resultSet3",
          id: "resultSet3",
          required: false,
          localized: false,
          validations: [
            {
              regexp: {
                pattern: "\\d+ - \\d+",
                flags: "",
              },
            },
          ],
        },
        {
          type: "Boolean",
          name: "Winner",
          apiName: "winner",
          id: "winner",
          required: false,
          localized: false,
        },
      ],
    }
  );
};

export const createPlayerContentType = async (sdk: PageAppSDK) => {
  await sdk.cma.contentType.createWithId(
    { contentTypeId: "player" },
    {
      name: "Player",
      displayField: "name",
      fields: [
        {
          type: "Symbol",
          name: "Name",
          apiName: "name",
          id: "name",
          required: true,
          localized: false,
        },
        {
          type: "Link",
          linkType: "Asset",
          name: "Profile Picture",
          apiName: "profilePicture",
          id: "profilePicture",
          localized: false,
          required: true,
        },
      ],
    }
  );
};
