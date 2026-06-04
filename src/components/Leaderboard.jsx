// Persistent high-score list — top chip balances saved across all sessions.
export default function Leaderboard({ entries }) {
  return (
    <section className="leaderboard">
      <h2 className="leaderboard__title">🏆 Leaderboard</h2>
      {entries.length === 0 ? (
        <p className="leaderboard__empty">No scores yet — be the first!</p>
      ) : (
        <ol className="leaderboard__list">
          {entries.map((entry, i) => (
            <li className="leaderboard__row" key={`${entry.name}-${entry.date}`}>
              <span className="leaderboard__rank">{i + 1}</span>
              <span className="leaderboard__name">{entry.name}</span>
              <span className="leaderboard__score">{entry.score} 🪙</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
