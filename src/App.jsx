import { useState, useEffect } from 'react';
import { api } from './api.js';
import { loadLeaderboard, addScore } from './leaderboard.js';
import Hand from './components/Hand.jsx';
import Scoreboard from './components/Scoreboard.jsx';
import BetControls from './components/BetControls.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import SaveScore from './components/SaveScore.jsx';

// Headline for a finished round, based on net chips won/lost.
function outcomeMessage(net) {
  if (net > 0) return { text: `You won +${net} chips! 🎉`, tone: 'win' };
  if (net < 0) return { text: `You lost ${Math.abs(net)} chips 😔`, tone: 'lose' };
  return { text: 'Push — even money 🤝', tone: 'push' };
}

export default function App() {
  const [state, setState] = useState(null); // latest serialized session
  const [phase, setPhase] = useState('betting'); // betting | playing | result
  const [bet, setBet] = useState(0); // pending bet during the betting phase
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scores, setScores] = useState(() => loadLeaderboard()); // persistent leaderboard

  // Save the current chip balance to the leaderboard under the given name.
  function saveScore(playerName) {
    if (!state) return;
    setScores(addScore(playerName, state.balance));
  }

  // Run an API call, syncing phase from the returned status.
  async function run(promise) {
    setLoading(true);
    setError(null);
    try {
      const next = await promise;
      setState(next);
      if (next.status === 'playing') setPhase('playing');
      else if (next.status === 'done') setPhase('result');
      else setPhase('betting');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Create a session on mount.
  useEffect(() => {
    run(api.newGame());
  }, []);

  function startBetting() {
    setBet(0);
    setError(null);
    setPhase('betting');
  }

  const id = state?.gameId;
  const dealt = state && phase !== 'betting' && state.hands.length > 0;
  const multi = state && state.hands.length > 1;
  const outcome = state && phase === 'result' ? outcomeMessage(state.lastNet ?? 0) : null;

  return (
    <div className="table">
      <h1 className="table__title">♠ Xenovanis&rsquo;s Table ♥</h1>
      <p className="table__subtitle">Blackjack</p>

      {state && (
        <header className="status-bar">
          <div className="balance">
            <span className="balance__label">Balance</span>
            <span className="balance__value">{state.balance}</span>
          </div>
          <Scoreboard {...state.scoreboard} />
        </header>
      )}

      {error && <p className="message message--lose">{error}</p>}

      {dealt && (
        <Hand
          title="Dealer"
          cards={state.dealerHand}
          value={state.dealerValue}
          hideValue={!state.revealDealer}
        />
      )}

      {outcome && <p className={`message message--${outcome.tone}`}>{outcome.text}</p>}

      {dealt && (
        <div className="player-hands">
          {state.hands.map((hand, i) => (
            <Hand
              key={i}
              title={multi ? `Hand ${i + 1}` : 'You'}
              cards={hand.cards}
              value={hand.value}
              bet={hand.bet}
              result={hand.result}
              active={hand.isActive}
              doubled={hand.doubled}
            />
          ))}
        </div>
      )}

      {/* Controls per phase */}
      {state && phase === 'betting' && (
        state.balance > 0 ? (
          <BetControls
            bet={bet}
            balance={state.balance}
            onAdd={(v) => setBet((b) => b + v)}
            onClear={() => setBet(0)}
            onDeal={() => run(api.deal(id, bet))}
            disabled={loading}
          />
        ) : (
          <div className="controls controls--column">
            <p className="message message--lose">You’re out of chips!</p>
            <SaveScore score={state.balance} onSave={saveScore} label="Save my run" />
            <button className="btn btn--new" onClick={() => run(api.newGame())} disabled={loading}>
              Start Over
            </button>
          </div>
        )
      )}

      {state && phase === 'playing' && (
        <div className="controls">
          <button className="btn btn--hit" onClick={() => run(api.hit(id))} disabled={loading}>
            Hit
          </button>
          <button className="btn btn--stand" onClick={() => run(api.stand(id))} disabled={loading}>
            Stand
          </button>
          {state.canDouble && (
            <button className="btn btn--double" onClick={() => run(api.double(id))} disabled={loading}>
              Double
            </button>
          )}
          {state.canSplit && (
            <button className="btn btn--split" onClick={() => run(api.split(id))} disabled={loading}>
              Split
            </button>
          )}
        </div>
      )}

      {state && phase === 'result' && (
        <div className="controls">
          <button className="btn btn--new" onClick={startBetting} disabled={loading}>
            New Round
          </button>
        </div>
      )}

      {!state && loading && <p className="message">Loading…</p>}

      {state && (
        <footer className="footer">
          {state.balance > 0 && <SaveScore score={state.balance} onSave={saveScore} />}
          <Leaderboard entries={scores} />
        </footer>
      )}
    </div>
  );
}
