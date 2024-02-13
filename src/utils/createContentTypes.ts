import { PageAppSDK } from "@contentful/app-sdk";

export const createTournamentContentType = async (sdk: PageAppSDK) => {
  const createdContentType = await sdk.cma.contentType.createWithId(
    { contentTypeId: "tournament" },
    {
      name: "Tournament",
      displayField: "name",
      fields: [
        {
          id: "name",
          name: "Name",
          type: "Symbol",
          required: true,
          localized: false,
        },
        {
          id: "players",
          name: "Players",
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
          required: false,
          localized: false,
        },
        {
          id: "matches",
          name: "Matches",
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
          required: false,
          localized: false,
        },
        {
          id: "rounds",
          name: "Rounds",
          type: "Integer",
          required: true,
          localized: false,
        },
      ],
    }
  );
  await sdk.cma.contentType.publish(
    { contentTypeId: "tournament" },
    createdContentType
  );
};

export const createMatchContentType = async (sdk: PageAppSDK) => {
  const createdContentType = await sdk.cma.contentType.createWithId(
    { contentTypeId: "match" },
    {
      name: "Match",
      displayField: "matchNumber",
      fields: [
        {
          id: "matchNumber",
          name: "Match Number",
          type: "Symbol",
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
          id: "isUpperBracket",
          name: "Is Upper Bracket",
          type: "Boolean",
          required: true,
          localized: false,
        },
        {
          id: "round",
          name: "Round",
          type: "Integer",
          required: true,
          localized: false,
        },
        {
          id: "roundMatchIndex",
          name: "Round Match Index",
          type: "Integer",
          required: true,
          localized: false,
        },
        {
          id: "player1",
          name: "Player 1",
          type: "Link",
          linkType: "Entry",
          required: false,
          localized: false,
          validations: [{ linkContentType: ["player"] }],
        },
        {
          id: "player2",
          name: "Player 2",
          type: "Link",
          linkType: "Entry",
          required: false,
          localized: false,
          validations: [{ linkContentType: ["player"] }],
        },
        {
          id: "resultSet1",
          name: "Result Set 1",
          type: "Symbol",
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
          id: "resultSet2",
          name: "Result Set 2",
          type: "Symbol",
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
          id: "resultSet3",
          name: "Result Set 3",
          type: "Symbol",
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
          id: "winner",
          name: "Winner",
          type: "Boolean",
          required: false,
          localized: false,
        },
      ],
    }
  );
  await sdk.cma.contentType.publish(
    { contentTypeId: "match" },
    createdContentType
  );
};

export const createPlayerContentType = async (sdk: PageAppSDK) => {
  const createdContentType = await sdk.cma.contentType.createWithId(
    { contentTypeId: "player" },
    {
      name: "Player",
      displayField: "name",
      fields: [
        {
          id: "name",
          name: "Name",
          type: "Symbol",
          required: true,
          localized: false,
        },
        {
          id: "profilePicture",
          name: "Profile Picture",
          type: "Link",
          linkType: "Asset",
          localized: false,
          required: true,
        },
      ],
    }
  );
  await sdk.cma.contentType.publish(
    { contentTypeId: "player" },
    createdContentType
  );
};
