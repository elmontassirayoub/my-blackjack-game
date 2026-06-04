// Persistent high-score leaderboard. There's no backend, so the browser's
// localStorage is the source of truth — scores survive across sessions.

const STORAGE_KEY = 'xenovanis-blackjack-leaderboard';
const MAX_ENTRIES = 10; // only the top scores are kept
const MAX_NAME_LENGTH = 20;

// Default scores shown until real players overtake them (date 0 ranks them
// below any later save that ties).
const SEED_SCORES = [
  { name: 'xeno', score: 1000000, date: 0 },
  { name: 'pixalord', score: 20000, date: 0 },
];

// Highest score first; earliest save wins ties so older records rank above
// later ones with the same chips.
function sortEntries(entries) {
  return [...entries].sort((a, b) => b.score - a.score || a.date - b.date);
}

// Read and parse the saved leaderboard, ranked. Returns [] if nothing is
// stored or the data is unreadable (corrupt / storage disabled).
export function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return sortEntries(SEED_SCORES).slice(0, MAX_ENTRIES);
    const entries = JSON.parse(raw);
    if (!Array.isArray(entries)) return sortEntries(SEED_SCORES).slice(0, MAX_ENTRIES);
    return sortEntries(entries).slice(0, MAX_ENTRIES);
  } catch {
    return sortEntries(SEED_SCORES).slice(0, MAX_ENTRIES);
  }
}

// Add a named score and persist. Returns the updated, ranked list so callers
// can drop it straight into state.
export function addScore(name, score) {
  const entry = {
    name: name.trim().slice(0, MAX_NAME_LENGTH) || 'Anonymous',
    score,
    date: Date.now(),
  };
  const next = sortEntries([...loadLeaderboard(), entry]).slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore write failures (e.g. private mode); the returned list still updates.
  }
  return next;
}
