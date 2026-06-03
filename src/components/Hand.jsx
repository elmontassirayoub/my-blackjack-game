import Card from './Card.jsx';

const RESULT_LABELS = { win: 'Win', lose: 'Lose', push: 'Push' };

// A labeled row of cards. Used for the dealer and each player hand.
// Optional props (bet, result, active, doubled) drive the player-hand chrome.
export default function Hand({ title, cards, value, hideValue, bet, result, active, doubled }) {
  return (
    <div className={`hand${active ? ' hand--active' : ''}`}>
      <div className="hand__header">
        <h2 className="hand__title">{title}</h2>
        {!hideValue && <span className="hand__value">{value}</span>}
        {doubled && <span className="hand__tag">2×</span>}
        {result && <span className={`hand__result hand__result--${result}`}>{RESULT_LABELS[result]}</span>}
      </div>
      <div className="hand__cards">
        {cards.map((card, i) => (
          <Card key={i} card={card} />
        ))}
      </div>
      {bet != null && <div className="hand__bet">Bet: {bet}</div>}
    </div>
  );
}
