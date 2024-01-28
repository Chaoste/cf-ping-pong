import React, { useEffect } from "react";
import { PageAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { TournamentsListPage } from "./TournamentsListPage";
import { CreateTournamentForm } from "./CreateTournamentForm";
import { TournamentPage } from "./TournamentPage";

interface InvocationParams {
  path: string;
}

export const PageRouter = () => {
  const internalSdk = useSDK<PageAppSDK>();
  const invocationParams = internalSdk.parameters
    .invocation as unknown as InvocationParams;
  return (
    <MemoryRouter initialEntries={[invocationParams.path]}>
      <PageRoutes />
    </MemoryRouter>
  );
};

const PageRoutes = () => {
  const internalSdk = useSDK<PageAppSDK>();
  const location = useLocation();

  useEffect(() => {
    internalSdk.navigator.openCurrentAppPage({ path: location.pathname });
  }, [location, internalSdk.navigator]);

  return (
    <Routes>
      <Route path="/" element={<TournamentsListPage />} />
      <Route path="/tournaments/create" element={<CreateTournamentForm />} />
      <Route path="/tournaments/:tournamentId" element={<TournamentPage />} />
    </Routes>
  );
};
