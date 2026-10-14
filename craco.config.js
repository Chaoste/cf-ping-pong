const path = require("path");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // The bundled SDK avoids CRA treating its CMA client's `.cjs` file as an asset.
      webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
        ({ constructor }) => constructor.name !== "ModuleScopePlugin",
      );
      webpackConfig.resolve.alias["@contentful/app-sdk$"] = path.resolve(
        __dirname,
        "node_modules/@contentful/app-sdk/dist/cf-extension-api.bundled.js",
      );

      return webpackConfig;
    },
  },
};
