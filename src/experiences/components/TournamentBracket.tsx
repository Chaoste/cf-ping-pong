import type { ExperienceComponentProps } from "../componentTypes";
import {
  isReadyMatch,
  isWalkover,
  playerName,
  score,
  toTournamentData,
  type TournamentMatch,
} from "../tournamentStatus";

export const TournamentBracket = (props: ExperienceComponentProps) => {
  const data = toTournamentData(props);

  if (!data) {
    return <p>The Tournament data assembly has not returned data yet.</p>;
  }

  const matches = data.matches ?? [];
  const upper = matches.filter((match) => match.isUpperBracket);
  const lower = matches.filter((match) => !match.isUpperBracket);

  return (
    <section style={sectionStyle}>
      <p style={eyebrowStyle}>BRACKET</p>
      <h2 style={{ fontSize: "28px", margin: "0 0 20px" }}>
        Tournament
      </h2>
      <BracketLane heading="Upper bracket" matches={upper} />
      <BracketLane heading="Lower bracket" matches={lower} />
    </section>
  );
};

const BracketLane = ({
  heading,
  matches,
}: {
  heading: string;
  matches: TournamentMatch[];
}) => {
  const rounds = Array.from(
    new Set(
      matches
        .map((match) => match.round)
        .filter((round): round is number => typeof round === "number"),
    ),
  ).sort((left, right) => left - right);

  if (rounds.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: "24px" }}>
      <h3 style={{ fontSize: "18px", margin: "0 0 12px" }}>{heading}</h3>
      <div
        style={{
          display: "flex",
          gap: "12px",
          overflowX: "auto",
          paddingBottom: "8px",
        }}
      >
        {rounds.map((round) => (
          <div
            key={round}
            style={{ display: "grid", flex: "0 0 200px", gap: "10px" }}
          >
            <strong style={{ color: "#53627c", fontSize: "14px" }}>
              Round {round}
            </strong>
            {matches
              .filter((match) => match.round === round)
              .sort(
                (left, right) =>
                  (left.roundMatchIndex ?? 0) - (right.roundMatchIndex ?? 0),
              )
              .map((match, index) => (
                <MatchCard
                  key={`${match.matchNumber ?? "match"}-${index}`}
                  match={match}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const MatchCard = ({ match }: { match: TournamentMatch }) => {
  const resultScore = score(match);
  const isSkipped = isWalkover(match);

  return (
    <article
      style={{
        background: isReadyMatch(match) ? "#e7eeff" : "#f8f9fc",
        border: `1px solid ${isReadyMatch(match) ? "#5577d8" : "#d3d9e5"}`,
        borderRadius: "10px",
        padding: "10px",
      }}
    >
      <strong
        style={{ display: "block", fontSize: "12px", marginBottom: "8px" }}
      >
        {match.matchNumber ?? "Match"}
      </strong>
      <Player
        name={
          isSkipped && !match.player1?.name
            ? "No opponent — match skipped"
            : playerName(match.player1)
        }
        isMissing={isSkipped && !match.player1?.name}
        isWinner={match.winner === true}
      />
      <Player
        name={
          isSkipped && !match.player2?.name
            ? "No opponent — match skipped"
            : playerName(match.player2)
        }
        isMissing={isSkipped && !match.player2?.name}
        isWinner={match.winner === false}
      />
      {resultScore && (
        <small style={{ color: "#53627c", display: "block", marginTop: "6px" }}>
          {resultScore}
        </small>
      )}
    </article>
  );
};

const Player = ({
  name,
  isMissing,
  isWinner,
}: {
  name: string;
  isMissing: boolean;
  isWinner: boolean;
}) => (
  <div
    style={{
      color: isMissing ? "#6d7587" : isWinner ? "#164c2e" : "#1f2a44",
      fontStyle: isMissing ? "italic" : "normal",
      fontWeight: isWinner ? 700 : 400,
      lineHeight: 1.5,
    }}
  >
    {name}
  </div>
);

const sectionStyle = {
  background: "#ffffff",
  border: "1px solid #d3d9e5",
  borderRadius: "16px",
  color: "#1f2a44",
  padding: "24px",
};

const eyebrowStyle = {
  color: "#53627c",
  fontSize: "14px",
  fontWeight: 700,
  margin: "0 0 4px",
};
