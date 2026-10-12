import type { ExperienceComponentProps } from "../componentTypes";
import {
  isPlayedMatch,
  isReadyMatch,
  isWalkover,
  toTournamentData,
} from "../tournamentStatus";

const metricStyle = {
  background: "#ffffff",
  border: "1px solid #d3d9e5",
  borderRadius: "12px",
  minWidth: "112px",
  padding: "16px",
};

export const TournamentStatus = ({ tournament }: ExperienceComponentProps) => {
  const data = toTournamentData(tournament);

  if (!data) {
    return <p>The Tournament data assembly has not returned data yet.</p>;
  }

  const matches = data.matches ?? [];
  const completed = matches.filter(isPlayedMatch).length;
  const ready = matches.filter(isReadyMatch).length;
  const walkovers = matches.filter(isWalkover).length;
  const waiting = matches.length - completed - ready - walkovers;

  return (
    <section
      style={{
        background: "#f1f5ff",
        borderRadius: "16px",
        color: "#1f2a44",
        padding: "24px",
      }}
    >
      <p style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 4px" }}>
        LIVE TOURNAMENT STATUS
      </p>
      <h1 style={{ fontSize: "32px", margin: "0 0 20px" }}>
        {data.name ?? "Tournament"}
      </h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
        <Metric label="Players" value={data.players?.length ?? 0} />
        <Metric label="Played" value={completed} />
        <Metric label="Ready now" value={ready} />
        <Metric label="Waiting" value={waiting} />
        <Metric label="Byes" value={walkovers} />
      </div>
    </section>
  );
};

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div style={metricStyle}>
    <div style={{ fontSize: "28px", fontWeight: 700 }}>{value}</div>
    <div style={{ color: "#53627c", fontSize: "14px" }}>{label}</div>
  </div>
);
