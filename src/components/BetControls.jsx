// Chip rack + bet entry for the betting phase.

const CHIPS = [
  { value: 5, className: 'chip--red' },
  { value: 25, className: 'chip--green' },
  { value: 100, className: 'chip--black' },
  { value: 500, className: 'chip--purple' },
];

export default function BetControls({ bet, balance, onAdd, onClear, onDeal, disabled }) {
  return (
    <div className="bet">
      <div className="bet__amount">
        <span className="bet__label">Bet</span>
        <span className="bet__value">{bet}</span>
      </div>

      <div className="chips">
        {CHIPS.map(({ value, className }) => (
          <button
            key={value}
            className={`chip ${className}`}
            onClick={() => onAdd(value)}
            disabled={disabled || bet + value > balance}
            title={`Add ${value}`}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="bet__actions">
        <button className="btn btn--clear" onClick={onClear} disabled={disabled || bet === 0}>
          Clear
        </button>
        <button className="btn btn--deal" onClick={onDeal} disabled={disabled || bet === 0}>
          Deal
        </button>
      </div>
    </div>
  );
}
