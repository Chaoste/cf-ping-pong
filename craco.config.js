const path = require("path");

const experiencesPackages = path.resolve(
  __dirname,
  "node_modules/@contentful/experiences-",
);

module.exports = {
  jest: {
    configure: (config) => ({
      ...config,
      transformIgnorePatterns: [
        "node_modules/(?!@contentful/(?:experiences-react|experiences-client|experiences-live-preview|experiences-sdk-core|experiences-design|experiences-runtime)/)",
      ],
    }),
  },
  webpack: {
    configure: (config) => {
      config.module.rules.push({
        include: (resource) => resource.startsWith(experiencesPackages),
        resolve: { fullySpecified: false },
        test: /\.m?js$/,
      });
      return config;
    },
  },
};
