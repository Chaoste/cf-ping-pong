import {
  createLivePreviewClient,
  sendPreviewStatus,
  type LivePreviewClient,
  type LivePreviewResult,
  type PreviewSessionOptions,
} from "@contentful/experiences-live-preview";
import type { ExperiencePayload } from "@contentful/experiences-sdk-core";
import { useEffect, useMemo, useSyncExternalStore } from "react";

type UseExperienceLivePreviewOptions = {
  initialPayload?: ExperiencePayload;
  previewSessionOptions?: PreviewSessionOptions;
};

export type UseExperienceLivePreviewResult = {
  readonly data: ExperiencePayload | undefined;
  readonly error: Error | undefined;
};

export const useExperienceLivePreview = ({
  initialPayload,
  previewSessionOptions,
}: UseExperienceLivePreviewOptions): UseExperienceLivePreviewResult => {
  const client = useMemo(() => {
    if (!previewSessionOptions) {
      return undefined;
    }

    return createLivePreviewClient(previewSessionOptions, initialPayload);
  }, [initialPayload, previewSessionOptions]);

  const staticSource = useMemo<
    Pick<LivePreviewClient, "getResult" | "subscribe">
  >(() => {
    const result: LivePreviewResult = {
      data: initialPayload,
      error: undefined,
    };

    return {
      getResult: () => result,
      subscribe: () => () => undefined,
    };
  }, [initialPayload]);

  const source = client ?? staticSource;
  const result = useSyncExternalStore(
    source.subscribe,
    source.getResult,
    source.getResult,
  );

  useEffect(() => {
    if (!client) {
      sendPreviewStatus("static");
      return;
    }

    return client.subscribeStatus(sendPreviewStatus);
  }, [client]);

  return result;
};
