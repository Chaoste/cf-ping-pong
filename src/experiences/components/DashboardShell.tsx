import type { ExperienceComponentProps } from "../componentTypes";

export const DashboardShell = ({ content }: ExperienceComponentProps) => (
  <main
    style={{
      background: "#f7f9fc",
      color: "#1f2a44",
      fontFamily: "system-ui, sans-serif",
      margin: 0,
      minHeight: "100vh",
      padding: "32px 20px 64px",
    }}
  >
    <div style={{ display: "grid", gap: "20px", margin: "0 auto", maxWidth: "1200px" }}>
      {content}
    </div>
  </main>
);
