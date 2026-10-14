import type { ExperienceComponentProps } from "../componentTypes";
import {
  getCurrentResults,
  isWalkover,
  playerName,
  score,
  toTournamentData,
  winnerName,
} from "../tournamentStatus";

export const CurrentResults = (props: ExperienceComponentProps) => {
  const data = toTournamentData(props);

  if (!data) {
    return <p>The Tournament data assembly has not returned data yet.</p>;
  }

  const results = getCurrentResults(data.matches ?? []);

  return (
    <section style={sectionStyle}>
      <p style={eyebrowStyle}>CURRENT RESULTS</p>
      {results.length === 0 ? (
        <p style={{ color: "#53627c", margin: 0 }}>
          No results have been recorded yet.
        </p>
      ) : (
        <div style={{ display: "grid" }}>
          {results.map((match, index) => {
            const isBye = isWalkover(match);
            const resultScore = score(match);
            return (
              <article
                key={`${match.matchNumber ?? "match"}-${index}`}
                style={{
                  alignItems: "center",
                  borderTop: "1px solid #d3d9e5",
                  display: "grid",
                  gap: "6px",
                  gridTemplateColumns:
                    "minmax(76px, 0.4fr) minmax(180px, 1fr) minmax(140px, 0.7fr)",
                  padding: "8px 0",
                }}
              >
                <strong>{match.matchNumber ?? "Match"}</strong>
                <span>
                  {playerName(match.player1)}{" "}
                  <span style={{ color: "#53627c" }}>vs</span>{" "}
                  {isBye && !match.player2?.name ? (
                    <span style={skippedOpponentStyle}>
                      No opponent — match skipped
                    </span>
                  ) : (
                    playerName(match.player2)
                  )}
                </span>
                <span style={{ fontWeight: 700 }}>
                  {isBye
                    ? `${winnerName(match)} advances — match skipped`
                    : `${winnerName(match)} won${resultScore ? ` · ${resultScore}` : ""}`}
                </span>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

const sectionStyle = {
  background: "#ffffff",
  border: "1px solid #d3d9e5",
  borderRadius: "12px",
  color: "#1f2a44",
  padding: "16px",
};

const eyebrowStyle = {
  color: "#53627c",
  fontSize: "12px",
  fontWeight: 700,
  margin: "0 0 4px",
};

const skippedOpponentStyle = {
  color: "#6d7587",
  fontStyle: "italic",
};
