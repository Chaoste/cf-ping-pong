const requiredEnvironment = [
  "CONTENTFUL_SPACE_ID",
  "CONTENTFUL_ENVIRONMENT_ID",
  "CONTENTFUL_CMA_TOKEN",
];

const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]);
if (missingEnvironment.length > 0) {
  throw new Error(`Missing environment variables: ${missingEnvironment.join(", ")}`);
}

const spaceId = process.env.CONTENTFUL_SPACE_ID;
const environmentId = process.env.CONTENTFUL_ENVIRONMENT_ID;
const accessToken = process.env.CONTENTFUL_CMA_TOKEN;
const tournamentEntryId = process.env.CONTENTFUL_TOURNAMENT_ID ?? "3OWG1Azlu0l7DRvWSsQOxG";
const baseUrl = `https://api.contentful.com/spaces/${spaceId}/environments/${environmentId}`;

const componentUrn = (id) =>
  `crn:contentful:::experience:spaces/$self/environments/$self/components/${id}`;
const templateUrn = (id) =>
  `crn:contentful:::experience:spaces/$self/environments/$self/experienceTemplates/${id}`;
const assemblyUrn = (id) =>
  `crn:contentful:::experience:spaces/$self/environments/$self/dataAssemblies/${id}`;
const fragmentUrn = (id) =>
  `crn:contentful:::experience:spaces/$self/environments/$self/experienceFragments/${id}`;
const entryUrn = (id) =>
  `crn:contentful:::content:spaces/$self/environments/$self/entries/${id}`;

const resourceLink = (linkType, urn) => ({
  sys: { type: "ResourceLink", linkType, urn },
});

const contentSource = "crn:contentful:::content:spaces/$self/environments/$self";
const tournamentProperty = {
  id: "tournament",
  name: "Tournament",
  required: true,
  type: "Record",
  fields: [
    { id: "name", name: "Name", type: "String" },
    {
      id: "players",
      name: "Players",
      type: "Array",
      items: {
        name: "Player",
        type: "Record",
        fields: [{ id: "name", name: "Name", type: "String" }],
      },
    },
    {
      id: "matches",
      name: "Matches",
      type: "Array",
      items: {
        name: "Match",
        type: "Record",
        fields: [
          { id: "matchNumber", name: "Match number", type: "String" },
          { id: "isUpperBracket", name: "Upper bracket", type: "Boolean" },
          { id: "round", name: "Round", type: "Integer" },
          { id: "roundMatchIndex", name: "Round match index", type: "Integer" },
          { id: "resultSet1", name: "Result set 1", type: "String" },
          { id: "resultSet2", name: "Result set 2", type: "String" },
          { id: "resultSet3", name: "Result set 3", type: "String" },
          { id: "winner", name: "Winner", type: "Boolean" },
          {
            id: "player1",
            name: "Player 1",
            type: "Record",
            fields: [{ id: "name", name: "Name", type: "String" }],
          },
          {
            id: "player2",
            name: "Player 2",
            type: "Record",
            fields: [{ id: "name", name: "Name", type: "String" }],
          },
        ],
      },
    },
  ],
};

const dashboardComponents = [
  {
    id: "tournament-dashboard-shell",
    name: "Tournament dashboard shell",
    description: "A responsive page shell for the tournament dashboard Experience.",
    contentProperties: [],
    slots: [{ id: "content", name: "Content", required: false, validations: [] }],
  },
  {
    id: "tournament-status",
    name: "Tournament status",
    description: "Shows participation and live tournament progress.",
    contentProperties: [tournamentProperty],
    slots: [],
  },
  {
    id: "next-match",
    name: "Next match",
    description: "Shows the first playable match in tournament bracket order.",
    contentProperties: [tournamentProperty],
    slots: [],
  },
  {
    id: "current-results",
    name: "Current results",
    description: "Shows played matches and automatic advances.",
    contentProperties: [tournamentProperty],
    slots: [],
  },
  {
    id: "tournament-bracket",
    name: "Tournament bracket",
    description: "Shows the full upper and lower tournament brackets.",
    contentProperties: [tournamentProperty],
    slots: [],
  },
];

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/vnd.contentful.management.v1+json",
      "X-Contentful-Enable-Alpha-Feature": "new-exo-entity-types",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.text()).slice(0, 1500);
    throw new Error(`${options.method ?? "GET"} ${path} failed (${response.status}): ${body}`);
  }

  if (response.status === 204) {
    return undefined;
  }

  return response.json();
};

const getOrUndefined = async (path) => {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/vnd.contentful.management.v1+json",
      "X-Contentful-Enable-Alpha-Feature": "new-exo-entity-types",
    },
  });

  if (response.status === 404) {
    return undefined;
  }
  if (!response.ok) {
    const body = (await response.text()).slice(0, 1500);
    throw new Error(`GET ${path} failed (${response.status}): ${body}`);
  }
  return response.json();
};

const isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);

const isSubset = (expected, actual) => {
  if (Array.isArray(expected)) {
    return (
      Array.isArray(actual) &&
      expected.length === actual.length &&
      expected.every((value, index) => isSubset(value, actual[index]))
    );
  }
  if (isRecord(expected)) {
    return (
      isRecord(actual) &&
      Object.entries(expected).every(([key, value]) => isSubset(value, actual[key]))
    );
  }
  return Object.is(expected, actual);
};

const isCurrentVersionPublished = (entity) =>
  entity?.sys.publishedVersion === entity?.sys.version - 1;

const publish = async (collection, id, entity, body) => {
  if (isCurrentVersionPublished(entity)) {
    return entity;
  }

  await request(`/${collection}/${id}/published`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(entity.sys.version) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return getOrUndefined(`/${collection}/${id}`);
};

const upsert = async (collection, id, body, publishEntity = true) => {
  const current = await getOrUndefined(`/${collection}/${id}`);
  if (current && isSubset(body, current)) {
    return publishEntity ? publish(collection, id, current) : current;
  }
  const entity = await request(`/${collection}/${id}`, {
    method: "PUT",
    headers: current ? { "X-Contentful-Version": String(current.sys.version) } : {},
    body: JSON.stringify(body),
  });
  return publishEntity ? publish(collection, id, entity) : entity;
};

const componentBody = (component, dataAssemblyId) => ({
  name: component.name,
  description: component.description,
  contentProperties: component.contentProperties,
  designProperties: [],
  slots: component.slots,
  metadata: { tags: [] },
  ...(dataAssemblyId
    ? {
        dataAssemblies: [
          resourceLink("Contentful:DataAssembly", assemblyUrn(dataAssemblyId)),
        ],
      }
    : {}),
});

const upsertComponents = async (dataAssemblyId) => {
  for (const component of dashboardComponents) {
    await upsert(
      "components",
      component.id,
      componentBody(
        component,
        component.contentProperties.length > 0 ? dataAssemblyId : undefined
      )
    );
    console.log(`Ensured component: ${component.id}`);
  }
};

const upsertTemplate = () =>
  upsert("experience_templates", "tournament-dashboard", {
    name: "Tournament dashboard",
    description: "Composable dashboard layout for a tournament Experience.",
    contentProperties: [],
    designProperties: [],
    slots: [{ id: "content", name: "Content", required: false, validations: [] }],
    componentTree: [
      {
        id: "dashboard-shell",
        nodeType: "Component",
        component: resourceLink(
          "Contentful:Component",
          componentUrn("tournament-dashboard-shell")
        ),
        contentProperties: {},
        designProperties: {},
        slots: {
          content: [{ id: "dashboard-content", nodeType: "Slot", slotId: "content" }],
        },
      },
    ],
    metadata: {
      tags: [],
      annotations: {
        ExperienceTemplate: [
          {
            sys: {
              id: "Contentful:ComposedImplementation",
              linkType: "Annotation",
              type: "Link",
            },
          },
        ],
      },
    },
  });

const findOrCreateDataAssembly = async () => {
  const collection = await request("/data_assemblies?limit=100");
  const matches = collection.items.filter(
    (assembly) => assembly.name === "Tournament dashboard data"
  );
  if (matches.length > 1) {
    throw new Error("More than one Data Assembly is named \"Tournament dashboard data\".");
  }

  const body = {
    name: "Tournament dashboard data",
    description: "Maps a Tournament entry to the tournament dashboard components.",
    metadata: { tags: [] },
    parameters: {
      tournament: {
        name: "Tournament",
        type: "ResourceLink",
        allowedResources: [
          {
            type: "Contentful:Entry",
            source: contentSource,
            allowedTypes: ["tournament"],
          },
        ],
      },
    },
    resolvers: {
      tournament: {
        source: "Contentful:GraphQL",
        query: `query ($id: ID!) {
  _node(id: $id) {
    ... on Tournament {
      name
      playersCursorCollection(limit: 100) {
        items { name }
      }
      matchesCursorCollection(limit: 100) {
        items {
          matchNumber
          isUpperBracket
          round
          roundMatchIndex
          resultSet1
          resultSet2
          resultSet3
          winner
          player1 { name }
          player2 { name }
        }
      }
    }
  }
}`,
        parameters: { id: "$parameters/tournament" },
      },
    },
    return: {
      tournament: {
        $object: {
          name: { $from: "$resolvers/tournament/_node/name" },
          players: { $from: "$resolvers/tournament/_node/playersCursorCollection/items" },
          matches: { $from: "$resolvers/tournament/_node/matchesCursorCollection/items" },
        },
      },
    },
  };

  if (matches.length === 0) {
    const created = await request("/data_assemblies", {
      method: "POST",
      body: JSON.stringify({
        ...body,
        sys: { type: "DataAssembly", dataType: [tournamentProperty] },
      }),
    });
    await publish("data_assemblies", created.sys.id, created);
    console.log(`Ensured data assembly: ${created.sys.id}`);
    return created.sys.id;
  }

  const current = await getOrUndefined(`/data_assemblies/${matches[0].sys.id}`);
  const updateBody = {
    ...body,
    sys: {
      id: current.sys.id,
      type: "DataAssembly",
      version: current.sys.version,
      dataType: [tournamentProperty],
    },
  };
  if (isSubset(updateBody, current)) {
    await publish("data_assemblies", current.sys.id, current);
    console.log(`Ensured data assembly: ${current.sys.id}`);
    return current.sys.id;
  }
  const updated = await request(`/data_assemblies/${current.sys.id}`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(current.sys.version) },
    body: JSON.stringify(updateBody),
  });
  await publish("data_assemblies", updated.sys.id, updated);
  console.log(`Ensured data assembly: ${updated.sys.id}`);
  return updated.sys.id;
};

const binding = (dataAssemblyId) => ({
  sys: resourceLink("Contentful:DataAssembly", assemblyUrn(dataAssemblyId)).sys,
  parameters: {
    tournament: {
      $literal: resourceLink("Contentful:Entry", entryUrn(tournamentEntryId)),
    },
  },
});

const fragmentDefinitions = [
  ["tournament-status-fragment", "Tournament status", "tournament-status"],
  ["next-match-fragment", "Next match", "next-match"],
  ["current-results-fragment", "Current results", "current-results"],
  ["tournament-bracket-fragment", "Tournament bracket", "tournament-bracket"],
];

const upsertFragments = async (dataAssemblyId, publishEntity) => {
  for (const [id, name, componentId] of fragmentDefinitions) {
    const existing = await getOrUndefined(`/experience_fragments/${id}`);
    await upsert("experience_fragments", id, {
      name,
      description: `${name} for a tournament dashboard Experience.`,
      ...(existing
        ? {}
        : { component: resourceLink("Contentful:Component", componentUrn(componentId)) }),
      contentBindings: binding(dataAssemblyId),
      designProperties: {},
      metadata: { tags: [], concepts: [] },
      slots: {},
    }, publishEntity);
    console.log(`${publishEntity ? "Published" : "Prepared draft"} fragment: ${id}`);
  }
};

const upsertExperience = async (publishEntity) => {
  const slots = {
    content: fragmentDefinitions.map(([id]) => ({
      id,
      nodeType: "ExperienceFragment",
      experienceFragment: resourceLink("Contentful:ExperienceFragment", fragmentUrn(id)),
    })),
  };
  const existing = await getOrUndefined("/experiences/ping-pong-dashboard");
  const body = {
    name: "Ping Pong dashboard",
    description: "A reusable, data-assembled tournament dashboard.",
    designProperties: {},
    metadata: { tags: [], concepts: [] },
    slots,
    ...(existing
      ? {}
      : {
          experienceTemplate: resourceLink(
            "Contentful:ExperienceTemplate",
            templateUrn("tournament-dashboard")
          ),
        }),
  };
  await upsert("experiences", "ping-pong-dashboard", body, publishEntity);
  console.log(`${publishEntity ? "Published" : "Prepared draft"} Experience: ping-pong-dashboard`);
};

await upsertComponents();
await upsertTemplate();
const dataAssemblyId = await findOrCreateDataAssembly();
await upsertComponents(dataAssemblyId);
const tournament = await getOrUndefined(`/entries/${tournamentEntryId}`);
const publishBoundEntities = isCurrentVersionPublished(tournament);
await upsertFragments(dataAssemblyId, publishBoundEntities);
await upsertExperience(publishBoundEntities);

console.log(
  publishBoundEntities
    ? "Experience Orchestration setup complete."
    : "Experience Orchestration preview setup complete. Publish the Tournament, then rerun this script to publish the bound XO resources."
);
