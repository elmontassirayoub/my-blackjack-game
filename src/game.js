// Core Blackjack engine — runs entirely in the browser. Pure deck handling
// plus a stateful per-player session supporting bankroll, betting, multiple
// hands (split), double-down, and a running scoreboard.

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const STARTING_BALANCE = 1000;
const MAX_HANDS = 4; // cap on hands created via splitting

// Build a fresh 52-card deck.
function buildDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

// Fisher–Yates shuffle (in place).
function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Blackjack value of a single card (ace high; resolved later in handValue).
function cardValue(card) {
  if (card.rank === 'A') return 11;
  if (['K', 'Q', 'J'].includes(card.rank)) return 10;
  return Number(card.rank);
}

// Best hand value: aces count as 11 unless that would bust, then 1.
export function handValue(hand) {
  let total = 0;
  let aces = 0;
  for (const card of hand) {
    total += cardValue(card);
    if (card.rank === 'A') aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function isBlackjack(cards) {
  return cards.length === 2 && handValue(cards) === 21;
}

function makeHand(cards, bet) {
  return { cards, bet, status: 'playing', doubled: false, result: null };
}

// A fresh player session: bankroll + scoreboard persist across rounds.
export function createSession() {
  return {
    balance: STARTING_BALANCE,
    deck: [],
    dealerHand: [],
    hands: [], // player hands; >1 after a split
    activeIndex: 0,
    status: 'betting', // betting | playing | done
    revealDealer: false,
    lastNet: null, // net chips won (+) / lost (−) on the last finished round
    scoreboard: { wins: 0, losses: 0, pushes: 0 },
  };
}

// Move the active pointer to the next playable hand; if none remain, the
// dealer plays out and the round settles.
function advance(session) {
  while (
    session.activeIndex < session.hands.length &&
    session.hands[session.activeIndex].status !== 'playing'
  ) {
    session.activeIndex++;
  }
  if (session.activeIndex >= session.hands.length) {
    finishRound(session);
  }
}

// Dealer reveals, draws to 17 if any player hand is live, then settle.
function finishRound(session) {
  session.revealDealer = true;
  const anyLive = session.hands.some((h) => h.status !== 'bust');
  if (anyLive) {
    while (handValue(session.dealerHand) < 17) {
      session.dealerHand.push(session.deck.pop());
    }
  }
  settle(session);
  session.status = 'done';
}

// Resolve every hand against the dealer and apply payouts to the bankroll.
// Bets were already deducted as they were placed, so we credit the returns.
function settle(session) {
  const dealerTotal = handValue(session.dealerHand);
  const dealerBust = dealerTotal > 21;
  const dealerBJ = isBlackjack(session.dealerHand);

  let returned = 0;
  let wagered = 0;

  for (const hand of session.hands) {
    wagered += hand.bet;
    const total = handValue(hand.cards);

    let result; // win | lose | push (blackjack pays as a win at 3:2)
    let blackjackPayout = false;

    if (hand.status === 'bust') {
      result = 'lose';
    } else if (hand.status === 'blackjack') {
      if (dealerBJ) result = 'push';
      else {
        result = 'win';
        blackjackPayout = true;
      }
    } else if (dealerBJ) {
      result = 'lose'; // dealer natural beats any non-natural
    } else if (dealerBust || total > dealerTotal) {
      result = 'win';
    } else if (total < dealerTotal) {
      result = 'lose';
    } else {
      result = 'push';
    }

    if (result === 'win') {
      returned += blackjackPayout ? hand.bet + Math.floor(hand.bet * 1.5) : hand.bet * 2;
      session.scoreboard.wins++;
    } else if (result === 'push') {
      returned += hand.bet;
      session.scoreboard.pushes++;
    } else {
      session.scoreboard.losses++;
    }

    hand.result = result;
  }

  session.balance += returned;
  session.lastNet = returned - wagered;
}

// Place a bet and deal a fresh round.
export function deal(session, rawBet) {
  const bet = Math.floor(Number(rawBet));
  if (!Number.isFinite(bet) || bet <= 0) {
    throw new Error('Bet must be a positive number.');
  }
  if (bet > session.balance) {
    throw new Error('Not enough chips for that bet.');
  }

  session.balance -= bet;
  session.lastNet = null;
  session.revealDealer = false;
  session.activeIndex = 0;

  const deck = shuffle(buildDeck());
  session.deck = deck;
  const playerCards = [deck.pop(), deck.pop()];
  session.dealerHand = [deck.pop(), deck.pop()];
  session.hands = [makeHand(playerCards, bet)];
  session.status = 'playing';

  // Resolve naturals immediately (dealer checks for blackjack).
  const playerBJ = isBlackjack(playerCards);
  const dealerBJ = isBlackjack(session.dealerHand);
  if (playerBJ) session.hands[0].status = 'blackjack';
  if (playerBJ || dealerBJ) {
    finishRound(session);
  }

  return session;
}

function requirePlaying(session) {
  if (session.status !== 'playing') {
    throw new Error('No hand in play.');
  }
  return session.hands[session.activeIndex];
}

// Draw a card into the active hand. Bust or 21 ends the hand.
export function hit(session) {
  const hand = requirePlaying(session);
  hand.cards.push(session.deck.pop());
  const total = handValue(hand.cards);
  if (total > 21) hand.status = 'bust';
  else if (total === 21) hand.status = 'stand';
  advance(session);
  return session;
}

// Stand on the active hand.
export function stand(session) {
  const hand = requirePlaying(session);
  hand.status = 'stand';
  advance(session);
  return session;
}

// Double the active hand's bet, take exactly one card, then stand.
export function double(session) {
  const hand = requirePlaying(session);
  if (hand.cards.length !== 2) {
    throw new Error('Can only double on the first two cards.');
  }
  if (session.balance < hand.bet) {
    throw new Error('Not enough chips to double down.');
  }
  session.balance -= hand.bet;
  hand.bet *= 2;
  hand.doubled = true;
  hand.cards.push(session.deck.pop());
  hand.status = handValue(hand.cards) > 21 ? 'bust' : 'stand';
  advance(session);
  return session;
}

// Split the active hand's pair into two hands, each receiving a new card.
export function split(session) {
  const hand = requirePlaying(session);
  if (hand.cards.length !== 2 || cardValue(hand.cards[0]) !== cardValue(hand.cards[1])) {
    throw new Error('Can only split a matching pair.');
  }
  if (session.hands.length >= MAX_HANDS) {
    throw new Error('Maximum number of hands reached.');
  }
  if (session.balance < hand.bet) {
    throw new Error('Not enough chips to split.');
  }

  session.balance -= hand.bet;
  const splittingAces = hand.cards[0].rank === 'A';

  // Second card moves to a new hand inserted right after the current one.
  const moved = hand.cards.pop();
  const newHand = makeHand([moved], hand.bet);
  session.hands.splice(session.activeIndex + 1, 0, newHand);

  // Deal one fresh card to each of the two hands.
  for (const h of [hand, newHand]) {
    h.cards.push(session.deck.pop());
    // Split aces get one card each and stand automatically.
    if (splittingAces) h.status = 'stand';
    else if (handValue(h.cards) === 21) h.status = 'stand';
  }

  advance(session);
  return session;
}

// Shape the session for the UI, hiding the dealer's hole card while in play.
export function serialize(session) {
  const dealt = session.hands.length > 0;

  let dealerHand = [];
  let dealerValue = 0;
  if (dealt) {
    dealerHand = session.revealDealer
      ? session.dealerHand
      : [session.dealerHand[0], { hidden: true }];
    dealerValue = session.revealDealer
      ? handValue(session.dealerHand)
      : handValue([session.dealerHand[0]]);
  }

  const active = session.status === 'playing' ? session.hands[session.activeIndex] : null;
  const canDouble = !!active && active.cards.length === 2 && session.balance >= active.bet;
  const canSplit =
    !!active &&
    active.cards.length === 2 &&
    cardValue(active.cards[0]) === cardValue(active.cards[1]) &&
    session.hands.length < MAX_HANDS &&
    session.balance >= active.bet;

  return {
    status: session.status,
    balance: session.balance,
    lastNet: session.lastNet ?? null,
    scoreboard: session.scoreboard,
    revealDealer: session.revealDealer,
    dealerHand,
    dealerValue,
    activeIndex: session.activeIndex,
    hands: session.hands.map((h, i) => ({
      cards: h.cards,
      value: handValue(h.cards),
      bet: h.bet,
      status: h.status,
      result: h.result,
      doubled: h.doubled,
      isActive: session.status === 'playing' && i === session.activeIndex,
    })),
    canDouble,
    canSplit,
    cardsLeft: session.deck.length,
  };
}
