import type { ExperienceComponentProps } from "../componentTypes";

export const DashboardShell = ({ content }: ExperienceComponentProps) => (
  <main
    style={{
      background: "#f7f9fc",
      color: "#1f2a44",
      fontFamily: "system-ui, sans-serif",
      margin: 0,
      minHeight: "100vh",
      padding: "16px 20px 32px",
    }}
  >
    <div style={{ display: "grid", gap: "12px", margin: "0 auto", maxWidth: "1600px" }}>
      {content}
    </div>
  </main>
);
