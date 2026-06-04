import { useState } from 'react';

// Name input + button that saves the player's current chip balance to the
// leaderboard. Reused for the always-available save and the game-over prompt.
export default function SaveScore({ score, onSave, label = 'Save to leaderboard' }) {
  const [name, setName] = useState('');
  const trimmed = name.trim();

  function submit(e) {
    e.preventDefault();
    if (!trimmed) return;
    onSave(trimmed);
    setName('');
  }

  return (
    <form className="save-score" onSubmit={submit}>
      <input
        className="save-score__input"
        type="text"
        value={name}
        maxLength={20}
        placeholder="Your name"
        aria-label="Your name"
        onChange={(e) => setName(e.target.value)}
      />
      <button className="btn btn--new" type="submit" disabled={!trimmed}>
        {label}
      </button>
      <span className="save-score__score">Score: {score} 🪙</span>
    </form>
  );
}
