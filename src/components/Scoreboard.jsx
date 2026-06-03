// Running tally of round outcomes for the session.
export default function Scoreboard({ wins, losses, pushes }) {
  return (
    <div className="scoreboard">
      <div className="scoreboard__item scoreboard__item--win">
        <span className="scoreboard__num">{wins}</span>
        <span className="scoreboard__label">Wins</span>
      </div>
      <div className="scoreboard__item scoreboard__item--loss">
        <span className="scoreboard__num">{losses}</span>
        <span className="scoreboard__label">Losses</span>
      </div>
      <div className="scoreboard__item scoreboard__item--push">
        <span className="scoreboard__num">{pushes}</span>
        <span className="scoreboard__label">Pushes</span>
      </div>
    </div>
  );
}
