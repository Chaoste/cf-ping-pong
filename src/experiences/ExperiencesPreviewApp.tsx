import {
  createLivePreviewClient,
  fetchPreviewSession,
  sendPreviewStatus,
  type PreviewSessionOptions,
} from "@contentful/experiences-live-preview";
import {
  fetchExperience,
  resolveExperience,
  type PortableRenderPlan,
} from "@contentful/experiences-react";
import { useEffect, useMemo, useState } from "react";
import { ExperiencePlanRenderer, experienceConfig } from "./ExperiencePlanRenderer";
import { resolvePreviewEnvironmentId } from "./previewEnvironment";

type PreviewConfiguration = {
  deliveryToken: string;
  environmentId: string;
  experienceId: string;
  preview: boolean;
  previewToken?: string;
  spaceId: string;
};

const previewConfiguration = (): PreviewConfiguration | undefined => {
  const spaceId = process.env.REACT_APP_CONTENTFUL_SPACE_ID;
  const environmentId = resolvePreviewEnvironmentId(
    process.env.REACT_APP_CONTENTFUL_ENVIRONMENT_ID,
    new URLSearchParams(window.location.search),
  );
  const deliveryToken = process.env.REACT_APP_CONTENTFUL_DELIVERY_TOKEN;
  const preview = process.env.REACT_APP_CONTENTFUL_USE_PREVIEW !== "false";
  const previewToken = process.env.REACT_APP_CONTENTFUL_PREVIEW_TOKEN;

  if (
    !spaceId ||
    !environmentId ||
    !deliveryToken ||
    (preview && !previewToken)
  ) {
    return undefined;
  }

  return {
    deliveryToken,
    environmentId,
    experienceId:
      process.env.REACT_APP_CONTENTFUL_EXPERIENCE_ID ?? "ping-pong-dashboard",
    preview,
    previewToken,
    spaceId,
  };
};

const configuration = previewConfiguration();

const errorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "The Experience could not be loaded.";

export const ExperiencesPreviewApp = () => {
  const [plan, setPlan] = useState<PortableRenderPlan>();
  const [error, setError] = useState<string>();
  const [livePreviewError, setLivePreviewError] = useState<string>();
  const previewSessionOptions = useMemo<
    PreviewSessionOptions | undefined
  >(() => {
    if (!configuration?.previewToken) {
      return undefined;
    }

    const query = new URLSearchParams(window.location.search);
    const sessionId = query.get("preview_session_id");

    if (!sessionId) {
      return undefined;
    }

    return {
      environmentId: configuration.environmentId,
      previewToken: configuration.previewToken,
      resourceResolution: query.get("resource_resolution") ?? undefined,
      sessionId,
      spaceId: configuration.spaceId,
    };
  }, []);
  useEffect(() => {
    if (!configuration) {
      return;
    }

    let isCurrent = true;

    const loadPlan = previewSessionOptions
      ? fetchPreviewSession(
          {
            environmentId: previewSessionOptions.environmentId,
            resourceResolution: previewSessionOptions.resourceResolution,
            sessionId: previewSessionOptions.sessionId!,
            spaceId: previewSessionOptions.spaceId,
          },
          { previewToken: previewSessionOptions.previewToken! },
          { config: experienceConfig },
        )
      : fetchExperience(
          {
            spaceId: configuration.spaceId,
            environmentId: configuration.environmentId,
            experienceId:
              new URLSearchParams(window.location.search).get(
                "experience_id",
              ) ?? configuration.experienceId,
            locale: "en-US",
          },
          {
            accessToken: configuration.deliveryToken,
            preview: configuration.preview,
            previewToken: configuration.previewToken,
          },
          { config: experienceConfig },
        );

    void loadPlan.then(
      (loadedPlan) => {
        if (isCurrent) {
          setPlan(loadedPlan);
        }
      },
      (reason: unknown) => {
        if (isCurrent) {
          setError(errorMessage(reason));
        }
      },
    );

    return () => {
      isCurrent = false;
    };
  }, [previewSessionOptions]);

  useEffect(() => {
    if (!previewSessionOptions) {
      sendPreviewStatus("static");
      return;
    }

    let isCurrent = true;
    const livePreviewClient = createLivePreviewClient(previewSessionOptions);
    const unsubscribeStatus = livePreviewClient.subscribeStatus(sendPreviewStatus);
    const unsubscribe = livePreviewClient.subscribe(() => {
      const { data, error: connectionError } = livePreviewClient.getResult();

      if (connectionError) {
        setLivePreviewError(errorMessage(connectionError));
        return;
      }
      if (!data) {
        return;
      }

      void resolveExperience(data, experienceConfig).then(
        (updatedPlan) => {
          if (isCurrent) {
            setLivePreviewError(undefined);
            setPlan(updatedPlan);
          }
        },
        (reason: unknown) => {
          if (isCurrent) {
            setLivePreviewError(errorMessage(reason));
          }
        },
      );
    });

    return () => {
      isCurrent = false;
      unsubscribe();
      unsubscribeStatus();
    };
  }, [previewSessionOptions]);

  if (!configuration) {
    return (
      <SetupMessage>
        Add the Contentful preview values from <code>.env.example</code> to an
        ignored <code>.env.local</code> file before starting the Experience
        preview.
      </SetupMessage>
    );
  }

  if (error) {
    return <SetupMessage>Could not load the Experience: {error}</SetupMessage>;
  }

  if (!plan) {
    return <SetupMessage>Loading the tournament Experience…</SetupMessage>;
  }

  return (
    <>
      {livePreviewError && (
        <SetupMessage>
          The Live Preview connection was interrupted. The last rendered
          Experience remains visible.
        </SetupMessage>
      )}
      <ExperiencePlanRenderer plan={plan} />
    </>
  );
};

const SetupMessage = ({ children }: { children: React.ReactNode }) => (
  <main
    style={{
      color: "#1f2a44",
      fontFamily: "system-ui, sans-serif",
      margin: "48px auto",
      maxWidth: "680px",
      padding: "0 24px",
    }}
  >
    {children}
  </main>
);
