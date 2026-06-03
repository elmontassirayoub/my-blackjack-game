# ♠ Xenovanis's Table ♥

A small Blackjack game built with React (Vite). The full game engine runs in
the browser, so it deploys as a pure static site — no backend required.

## Rules implemented

- Standard 52-card deck, reshuffled each round.
- Dealer hits until 17 and stands on all 17s.
- Aces count as 11 unless that busts the hand, then 1.
- Natural blackjack pays 3:2; dealer's hole card stays hidden until you stand or bust.
- Betting with a persistent bankroll + scoreboard (wins / losses / pushes).
- **Double-down** (one card, doubled bet) and **split** (matching pairs, up to 4 hands; split aces draw one card and stand).

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build

```bash
npm run build      # outputs static files to dist/
npm run preview    # serve the production build locally
```

## Project structure

```
index.html
vite.config.js
src/
  main.jsx          React entry
  App.jsx           table UI + game flow
  game.js           the blackjack engine (deck, hands, payouts)
  api.js            local driver that runs the engine in-browser
  index.css
  components/        Card, Hand, Scoreboard, BetControls
```

## Deploy

It's a standard Vite app, so any static host works. On **Vercel**, import the
repo and accept the auto-detected settings (framework: Vite, build:
`npm run build`, output: `dist`).
