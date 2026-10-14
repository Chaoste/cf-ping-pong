import { resolvePreviewEnvironmentId } from "./previewEnvironment";

describe("resolvePreviewEnvironmentId", () => {
  it("uses the environment passed by a Preview Environment", () => {
    expect(
      resolvePreviewEnvironmentId(
        "cf-tournament-2026-10-15",
        new URLSearchParams("environment_id=cf-tournament-demo-2026-10-14"),
      ),
    ).toBe("cf-tournament-demo-2026-10-14");
  });

  it("uses the configured environment when the Preview Environment has no override", () => {
    expect(
      resolvePreviewEnvironmentId(
        "cf-tournament-2026-10-15",
        new URLSearchParams(),
      ),
    ).toBe("cf-tournament-2026-10-15");
  });
});
