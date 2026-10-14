const resourceId = (urn) =>
  typeof urn === "string" ? urn.split("/").at(-1) : undefined;

const tournamentIdFrom = (parameters) => {
  for (const parameter of Object.values(parameters ?? {})) {
    const resource = parameter?.$literal;
    if (resource?.sys?.linkType === "Contentful:Entry") {
      return resourceId(resource.sys.urn);
    }
  }
};

module.exports = async (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Cache-Control", "no-store");

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "GET") {
    response.status(405).json({ error: "Only GET requests are supported." });
    return;
  }

  const experienceId = request.query.experienceId;
  if (
    typeof experienceId !== "string" ||
    !/^[a-zA-Z0-9_-]+$/.test(experienceId)
  ) {
    response.status(400).json({ error: "A valid experienceId is required." });
    return;
  }

  const { CONTENTFUL_CMA_TOKEN, CONTENTFUL_ENVIRONMENT_ID, CONTENTFUL_SPACE_ID } =
    process.env;
  if (!CONTENTFUL_CMA_TOKEN || !CONTENTFUL_ENVIRONMENT_ID || !CONTENTFUL_SPACE_ID) {
    response.status(500).json({ error: "The Contentful server configuration is incomplete." });
    return;
  }

  try {
    const contentfulResponse = await fetch(
      `https://api.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT_ID}/experiences/${experienceId}`,
      {
        headers: {
          Authorization: `Bearer ${CONTENTFUL_CMA_TOKEN}`,
          "X-Contentful-Enable-Alpha-Feature": "new-exo-entity-types",
        },
      },
    );

    if (!contentfulResponse.ok) {
      response.status(contentfulResponse.status).json({ error: "The Experience could not be loaded." });
      return;
    }

    const experience = await contentfulResponse.json();
    const dataAssemblyId = resourceId(experience.contentBindings?.sys?.urn);
    const tournamentId = tournamentIdFrom(experience.contentBindings?.parameters);

    if (!dataAssemblyId || !tournamentId) {
      response.status(422).json({ error: "The Experience does not define a tournament binding." });
      return;
    }

    response.status(200).json({ dataAssemblyId, tournamentId });
  } catch (error) {
    console.error("[cf-ping-pong] Could not load the Experience binding", error);
    response.status(502).json({ error: "The Experience binding could not be loaded." });
  }
};
