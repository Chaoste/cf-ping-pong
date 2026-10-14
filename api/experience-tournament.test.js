const assert = require("node:assert/strict");
const test = require("node:test");

const handler = require("./experience-tournament");

const withEnvironment = async (callback) => {
  const originalEnvironment = process.env;
  process.env = {
    ...originalEnvironment,
    CONTENTFUL_CMA_TOKEN: "test-token",
    CONTENTFUL_ENVIRONMENT_ID: "default-environment",
    CONTENTFUL_SPACE_ID: "test-space",
  };

  try {
    await callback();
  } finally {
    process.env = originalEnvironment;
  }
};

const createResponse = () => {
  const result = {};
  const response = {
    end: () => result,
    json: (body) => {
      result.body = body;
      return result;
    },
    setHeader: () => response,
    status: (status) => {
      result.status = status;
      return response;
    },
  };

  return { response, result };
};

test("loads an Experience from the requested Contentful environment", async () => {
  let requestUrl;
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    requestUrl = url;
    return {
      json: async () => ({
        contentBindings: {
          parameters: {
            tournament: {
              $literal: {
                sys: {
                  linkType: "Contentful:Entry",
                  urn: "crn:contentful:::content:spaces/test-space/environments/demo/entries/tournament-1",
                },
              },
            },
          },
          sys: {
            urn: "crn:contentful:::content:spaces/test-space/environments/demo/data-assemblies/assembly-1",
          },
        },
      }),
      ok: true,
    };
  };
  const { response, result } = createResponse();

  try {
    await withEnvironment(() =>
      handler(
        {
          method: "GET",
          query: {
            environment_id: "demo-environment",
            experienceId: "experience-1",
          },
        },
        response,
      ),
    );
  } finally {
    global.fetch = originalFetch;
  }

  assert.equal(
    requestUrl,
    "https://api.contentful.com/spaces/test-space/environments/demo-environment/experiences/experience-1",
  );
  assert.deepEqual(result, {
    body: { dataAssemblyId: "assembly-1", tournamentId: "tournament-1" },
    status: 200,
  });
});
