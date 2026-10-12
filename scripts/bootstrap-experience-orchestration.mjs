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
const baseUrl = `https://api.contentful.com/spaces/${spaceId}/environments/${environmentId}`;

const componentUrn = (id) =>
  `crn:contentful:::experience:spaces/$self/environments/$self/components/${id}`;
const templateUrn = (id) =>
  `crn:contentful:::experience:spaces/$self/environments/$self/experienceTemplates/${id}`;
const fragmentUrn = (id) =>
  `crn:contentful:::experience:spaces/$self/environments/$self/experienceFragments/${id}`;

const resourceLink = (linkType, urn) => ({
  sys: { type: "ResourceLink", linkType, urn },
});

const matchFields = {
  completedAt: { id: "completedAt", name: "Completed at", type: "String" },
  isUpperBracket: {
    id: "isUpperBracket",
    name: "Upper bracket",
    type: "Boolean",
  },
  matchNumber: { id: "matchNumber", name: "Match number", type: "String" },
  player1Name: { id: "player1Name", name: "Player 1 name", type: "String" },
  player2Name: { id: "player2Name", name: "Player 2 name", type: "String" },
  resultSet1: { id: "resultSet1", name: "Result set 1", type: "String" },
  resultSet2: { id: "resultSet2", name: "Result set 2", type: "String" },
  resultSet3: { id: "resultSet3", name: "Result set 3", type: "String" },
  round: { id: "round", name: "Round", type: "Integer" },
  roundMatchIndex: {
    id: "roundMatchIndex",
    name: "Round match index",
    type: "Integer",
  },
  winner: { id: "winner", name: "Winner", type: "Boolean" },
};

const matchesProperty = (fieldIds) => ({
  id: "matches",
  name: "Matches",
  required: false,
  type: "Array",
  items: {
    name: "Match",
    type: "Record",
    fields: fieldIds.map((fieldId) => matchFields[fieldId]),
  },
});

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
    contentProperties: [matchesProperty(["winner", "player1Name", "player2Name"])],
    slots: [],
  },
  {
    id: "next-match",
    name: "Next match",
    description: "Shows the first playable match in tournament bracket order.",
    contentProperties: [
      matchesProperty([
        "matchNumber",
        "isUpperBracket",
        "round",
        "roundMatchIndex",
        "winner",
        "player1Name",
        "player2Name",
      ]),
    ],
    slots: [],
  },
  {
    id: "current-results",
    name: "Current results",
    description: "Shows played matches and automatic advances.",
    contentProperties: [
      matchesProperty([
        "matchNumber",
        "resultSet1",
        "resultSet2",
        "resultSet3",
        "completedAt",
        "winner",
        "player1Name",
        "player2Name",
      ]),
    ],
    slots: [],
  },
  {
    id: "tournament-bracket",
    name: "Tournament bracket",
    description: "Shows the full upper and lower tournament brackets.",
    contentProperties: [
      matchesProperty([
        "matchNumber",
        "isUpperBracket",
        "round",
        "roundMatchIndex",
        "resultSet1",
        "resultSet2",
        "resultSet3",
        "winner",
        "player1Name",
        "player2Name",
      ]),
    ],
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

const componentBody = (component, dataAssemblies) => ({
  name: component.name,
  description: component.description,
  contentProperties: component.contentProperties,
  designProperties: [],
  slots: component.slots,
  metadata: { tags: [] },
  ...(dataAssemblies === undefined ? {} : { dataAssemblies }),
});

const upsertComponents = async () => {
  for (const component of dashboardComponents) {
    const current = await getOrUndefined(`/components/${component.id}`);
    await upsert(
      "components",
      component.id,
      componentBody(component, current?.dataAssemblies ?? [])
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

const fragmentDefinitions = [
  ["tournament-status-fragment", "Tournament status", "tournament-status"],
  ["next-match-fragment", "Next match", "next-match"],
  ["current-results-fragment", "Current results", "current-results"],
  ["tournament-bracket-fragment", "Tournament bracket", "tournament-bracket"],
];

const upsertFragments = async (publishEntity) => {
  for (const [id, name, componentId] of fragmentDefinitions) {
    const existing = await getOrUndefined(`/experience_fragments/${id}`);
    if (existing) {
      console.log(`Preserved fragment: ${id}`);
      continue;
    }
    await upsert("experience_fragments", id, {
      name,
      description: `${name} for a tournament dashboard Experience.`,
      component: resourceLink("Contentful:Component", componentUrn(componentId)),
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
await upsertFragments(false);
await upsertExperience(false);

console.log(
  "Experience Orchestration structure is ready. Author each component's match query and field mappings in the Contentful UI before publishing the fragments and Experience.",
);
