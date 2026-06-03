// A single playing card. Renders a face-down card when `card.hidden` is set.

const RED_SUITS = ['♥', '♦'];

export default function Card({ card }) {
  if (card.hidden) {
    return <div className="card card--back" aria-label="Face-down card" />;
  }

  const isRed = RED_SUITS.includes(card.suit);
  return (
    <div className={`card ${isRed ? 'card--red' : 'card--black'}`}>
      <span className="card__rank">{card.rank}</span>
      <span className="card__suit">{card.suit}</span>
    </div>
  );
}
