import type { ExperienceComponentProps } from "../componentTypes";
import {
  getRegisteredPlayerCount,
  isPlayedMatch,
  isReadyMatch,
  isWalkover,
  toTournamentData,
} from "../tournamentStatus";

const metricStyle = {
  background: "#ffffff",
  border: "1px solid #d3d9e5",
  borderRadius: "10px",
  minWidth: "104px",
  padding: "10px 12px",
};

export const TournamentStatus = (props: ExperienceComponentProps) => {
  const data = toTournamentData(props);

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
        alignItems: "center",
        background: "#f1f5ff",
        borderRadius: "12px",
        color: "#1f2a44",
        display: "flex",
        flexWrap: "wrap",
        gap: "16px 24px",
        padding: "16px",
      }}
    >
      <div>
        <p
          style={{ fontSize: "12px", fontWeight: 700, margin: "0 0 2px" }}
        >
          LIVE TOURNAMENT STATUS
        </p>
        <h1 style={{ fontSize: "26px", margin: 0 }}>
          {data.tournamentName ?? "Tournament"}
        </h1>
      </div>
      <div
        style={{
          display: "flex",
          flex: "1 1 auto",
          flexWrap: "wrap",
          gap: "8px",
          justifyContent: "flex-end",
        }}
      >
        <Metric
          label="Registered players"
          value={getRegisteredPlayerCount(matches)}
        />
        <Metric label="Played matches" value={completed} />
        <Metric label="Ready matches" value={ready} />
        <Metric label="Waiting matches" value={waiting} />
        <Metric label="Skipped matches" value={walkovers} />
      </div>
    </section>
  );
};

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div style={metricStyle}>
    <div style={{ fontSize: "24px", fontWeight: 700 }}>{value}</div>
    <div style={{ color: "#53627c", fontSize: "12px" }}>{label}</div>
  </div>
);
