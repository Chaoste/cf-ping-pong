import React, { useMemo } from "react";
import { locations } from "@contentful/app-sdk";
import { PageRouter } from "./locations/PageRouter";
import { useSDK } from "@contentful/react-apps-toolkit";

const ComponentLocationSettings = {
  [locations.LOCATION_PAGE]: PageRouter,
};

const App = () => {
  const sdk = useSDK();

  const Component = useMemo(() => {
    for (const [location, component] of Object.entries(
      ComponentLocationSettings
    )) {
      if (sdk.location.is(location)) {
        return component;
      }
    }
  }, [sdk.location]);

  return Component ? <Component /> : null;
};

export default App;
