export const resolvePreviewEnvironmentId = (
  configuredEnvironmentId: string | undefined,
  query: URLSearchParams,
) => query.get("environment_id") ?? configuredEnvironmentId;
