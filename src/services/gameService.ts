import { db } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, arrayUnion, onSnapshot, deleteDoc } from 'firebase/firestore';

export type GameState = 'lobby' | 'playing' | 'results';
export type RoundPhase = 'ranking' | 'guessing' | 'revealing' | 'round_end';

export interface Game {
  id: string;
  hostId: string;
  state: GameState;
  players: string[]; // randomized array of player IDs for turn order
  includeDefaults: boolean;
  deck: Card[];
  discard: Card[];
  currentRound: number;
  rankerId: string;
  roundPhase: RoundPhase;
  playAreaCards: Card[];
  rankerRankings: number[]; // e.g. [1, 5, 2, 4, 3] representing the order
  guesserRankings: number[];
  revealedRankings: number[]; // Which ranker cards have been flipped face-up during 'revealing'
}

export interface PlayerData {
  id: string; // matches auth UID or anon ID
  name: string;
  gameId: string;
  score: number;
  isHost: boolean;
  cardCount: number; // to sync back to host
}

export interface Card {
  id: string;
  text: string;
  source: string; // player ID or name
}

// Generate a random 6-character uppercase code
export const generateGameCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create a new game
export const createGame = async (hostId: string, hostName: string): Promise<string> => {
  const gameId = generateGameCode();
  const gameRef = doc(db, 'games', gameId);
  
  await setDoc(gameRef, {
    id: gameId,
    hostId,
    state: 'lobby',
    players: [hostId],
    includeDefaults: false,
    deck: [],
    discard: [],
    currentRound: 0,
    rankerId: '',
    roundPhase: 'ranking',
    playAreaCards: [],
    rankerRankings: [1, 2, 3, 4, 5],
    guesserRankings: [1, 2, 3, 4, 5]
  });

  await joinGame(gameId, hostId, hostName, true);
  return gameId;
};

// Join a game
export const joinGame = async (gameId: string, playerId: string, playerName: string, isHost: boolean = false) => {
  const gameRef = doc(db, 'games', gameId);
  const gameSnap = await getDoc(gameRef);

  if (!gameSnap.exists()) {
    throw new Error('Game not found');
  }

  const gameData = gameSnap.data() as Game;
  if (!isHost && gameData.players.length >= 8 && !gameData.players.includes(playerId)) {
    throw new Error('Game is full');
  }

  const playerRef = doc(db, 'games', gameId, 'players', playerId);
  await setDoc(playerRef, {
    id: playerId,
    name: playerName,
    gameId,
    score: 0,
    isHost,
    cardCount: 0
  }, { merge: true });

  if (!gameData.players.includes(playerId)) {
    await updateDoc(gameRef, {
      players: arrayUnion(playerId)
    });
  }
};

// Subscriptions
export const subscribeToGame = (gameId: string, callback: (game: Game | null) => void) => {
  return onSnapshot(doc(db, 'games', gameId), (doc) => {
    if (doc.exists()) {
      callback(doc.data() as Game);
    } else {
      callback(null);
    }
  });
};

export const subscribeToPlayers = (gameId: string, callback: (players: PlayerData[]) => void) => {
  return onSnapshot(collection(db, 'games', gameId, 'players'), (snapshot) => {
    callback(snapshot.docs.map(d => d.data() as PlayerData));
  });
};

export const subscribeToCards = (gameId: string, playerId: string, callback: (cards: Card[]) => void) => {
  return onSnapshot(collection(db, 'games', gameId, 'players', playerId, 'cards'), (snapshot) => {
    callback(snapshot.docs.map(d => d.data() as Card));
  });
};

export const fetchAllCustomCardsCount = (players: PlayerData[]) => {
  return players.reduce((total, p) => total + (p.cardCount || 0), 0);
};

export const updatePlayerName = async (gameId: string, playerId: string, newName: string) => {
  const playerRef = doc(db, 'games', gameId, 'players', playerId);
  await updateDoc(playerRef, { name: newName });
};

export const startGame = async (gameId: string, includeDefaults: boolean) => {
  const gameRef = doc(db, 'games', gameId);
  const gameSnap = await getDoc(gameRef);
  if (!gameSnap.exists()) return;

  const gameData = gameSnap.data() as Game;

  // 1. Fetch all custom cards across all players
  const allCards: Card[] = [];
  const playersCol = collection(db, 'games', gameId, 'players');
  const playersSnap = await getDocs(playersCol);
  
  for (const playerDoc of playersSnap.docs) {
    const pId = playerDoc.id;
    const cardsCol = collection(db, 'games', gameId, 'players', pId, 'cards');
    const cardsSnap = await getDocs(cardsCol);
    for (const cardDoc of cardsSnap.docs) {
      allCards.push(cardDoc.data() as Card);
    }
  }

  // 2. Fetch Default cards if toggled
  if (includeDefaults) {
    try {
      const response = await fetch('/default-cards.txt');
      const text = await response.text();
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      for (const line of lines) {
        allCards.push({
          id: 'def-' + Math.random().toString(36).substr(2, 9),
          text: line.substring(0, 30),
          source: 'default'
        });
      }
    } catch (e) {
      console.warn("Could not load default cards", e);
    }
  }

  // 3. Shuffle Cards
  const shuffledDeck = allCards.sort(() => Math.random() - 0.5);

  // 4. Shuffle Player Order
  const shuffledPlayers = [...gameData.players].sort(() => Math.random() - 0.5);

  // 5. Deal first 5 cards
  const playAreaCards = shuffledDeck.splice(0, 5);

  // 6. Update Game State
  await updateDoc(gameRef, {
    state: 'playing',
    deck: shuffledDeck,
    players: shuffledPlayers,
    includeDefaults,
    currentRound: 1,
    rankerId: shuffledPlayers[0],
    roundPhase: 'ranking',
    playAreaCards,
    rankerRankings: [1, 2, 3, 4, 5],
    guesserRankings: [1, 2, 3, 4, 5],
    revealedRankings: []
  });
};
export const addCard = async (gameId: string, playerId: string, text: string) => {
  const cardId = Date.now().toString(); // simple ID gen
  const cardRef = doc(db, 'games', gameId, 'players', playerId, 'cards', cardId);
  await setDoc(cardRef, {
    id: cardId,
    text,
    source: playerId
  });
  
  // increment count
  const playerRef = doc(db, 'games', gameId, 'players', playerId);
  const snap = await getDoc(playerRef);
  if (snap.exists()) {
    await updateDoc(playerRef, { cardCount: (snap.data().cardCount || 0) + 1 });
  }
};

export const updateCardText = async (gameId: string, playerId: string, cardId: string, text: string) => {
  const cardRef = doc(db, 'games', gameId, 'players', playerId, 'cards', cardId);
  await updateDoc(cardRef, { text });
};

export const removeCard = async (gameId: string, playerId: string, cardId: string) => {
  const cardRef = doc(db, 'games', gameId, 'players', playerId, 'cards', cardId);
  await deleteDoc(cardRef);
  
  // decrement count
  const playerRef = doc(db, 'games', gameId, 'players', playerId);
  const snap = await getDoc(playerRef);
  if (snap.exists()) {
    const newCount = Math.max(0, (snap.data().cardCount || 0) - 1);
    await updateDoc(playerRef, { cardCount: newCount });
  }
};

export const updateRankerRankings = async (gameId: string, rankings: number[]) => {
  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, {
    rankerRankings: rankings
  });
};

export const confirmRankings = async (gameId: string) => {
  // Move phase to guessing
  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, {
    roundPhase: 'guessing'
  });
};

export const updateGuesserRankings = async (gameId: string, rankings: number[]) => {
  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, {
    guesserRankings: rankings
  });
};

export const confirmGuesses = async (gameId: string) => {
  // Move phase to revealing
  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, {
    roundPhase: 'revealing',
    revealedRankings: []
  });
};

export const revealRanking = async (gameId: string, numToReveal: number) => {
  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, {
    revealedRankings: arrayUnion(numToReveal)
  });
};

export const finishRound = async (gameId: string) => {
  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, {
    roundPhase: 'round_end'
  });
};

export const startNextRound = async (
  gameId: string, 
  currentRankerId: string, 
  roundScore: number, 
  currentDeck: Card[], 
  currentDiscard: Card[], 
  playAreaCards: Card[], 
  playersList: string[],
  currentRound: number
) => {
  // 1. apply score
  const playerRef = doc(db, 'games', gameId, 'players', currentRankerId);
  const playerSnap = await getDoc(playerRef);
  if (playerSnap.exists()) {
    const currentScore = playerSnap.data().score || 0;
    await updateDoc(playerRef, { score: currentScore + roundScore });
  }

  // 2. move playAreaCards into discard
  let newDiscard = [...(currentDiscard || []), ...playAreaCards];
  let newDeck = [...(currentDeck || [])];
  
  // 3. deal 5 new cards. Shuffle discard into deck if needed.
  if (newDeck.length < 5) {
    // shuffle discard
    for (let i = newDiscard.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDiscard[i], newDiscard[j]] = [newDiscard[j], newDiscard[i]];
    }
    newDeck = [...newDeck, ...newDiscard];
    newDiscard = [];
  }
  
  // Take up to 5 cards (if deck size is somehow less than 5, it just takes what it can)
  const newPlayAreaCards = newDeck.splice(0, 5);

  // 4. next ranker
  const currentRankerIndex = playersList.indexOf(currentRankerId);
  const nextRankerIndex = (currentRankerIndex + 1) % playersList.length;
  const nextRankerId = playersList[nextRankerIndex];

  // 5. update Game Doc
  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, {
    currentRound: currentRound + 1,
    rankerId: nextRankerId,
    roundPhase: 'ranking',
    deck: newDeck,
    discard: newDiscard,
    playAreaCards: newPlayAreaCards,
    rankerRankings: [1, 2, 3, 4, 5],
    guesserRankings: [1, 2, 3, 4, 5],
    revealedRankings: []
  });
};

export const endGameFromRound = async (gameId: string, currentRankerId: string, roundScore: number) => {
  // apply score
  const playerRef = doc(db, 'games', gameId, 'players', currentRankerId);
  const playerSnap = await getDoc(playerRef);
  if (playerSnap.exists()) {
    const currentScore = playerSnap.data().score || 0;
    await updateDoc(playerRef, { score: currentScore + roundScore });
  }

  // set state to results
  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, {
    state: 'results'
  });
};

