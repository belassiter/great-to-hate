import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as gameService from '../services/gameService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockDB: Record<string, any> = {};

vi.mock('../services/firebase', () => ({
  db: 'mock-db',
  auth: {
    currentUser: { uid: 'player1' },
    signInAnonymously: vi.fn(),
    onAuthStateChanged: vi.fn()
  }
}));

vi.mock('firebase/firestore', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doc: (_db: any, ...pathArgs: string[]) => pathArgs.join('/'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collection: (_db: any, ...pathArgs: string[]) => pathArgs.join('/'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setDoc: vi.fn(async (path: string, data: any) => {
      mockDB[path] = { ...data };
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateDoc: vi.fn(async (path: string, data: any) => {
      const existing = mockDB[path] || {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const next: any = { ...existing };
      for (const key of Object.keys(data)) {
        if (data[key] && data[key]._isArrayUnion) {
          next[key] = [...(existing[key] || []), data[key].val];
        } else {
          next[key] = data[key];
        }
      }
      mockDB[path] = next;
    }),
    getDoc: vi.fn(async (path: string) => {
      const data = mockDB[path];
      return {
        exists: () => !!data,
        data: () => data,
        id: path.split('/').pop()
      };
    }),
    getDocs: vi.fn(async (path: string) => {
      const docs = Object.keys(mockDB)
        .filter(k => k.startsWith(path + '/'))
        .map(k => ({
          exists: () => true,
          data: () => mockDB[k],
          id: k.split('/').pop()
        }));
      return { docs };
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    arrayUnion: vi.fn((val: any) => ({ _isArrayUnion: true, val })),
    onSnapshot: vi.fn(),
    deleteDoc: vi.fn()
  };
});

describe('Game Flow End-to-End Test (Service Level)', () => {
  beforeEach(() => {
    mockDB = {};
    vi.clearAllMocks();
  });

  it('plays a full game over multiple rounds', async () => {
    const hostId = 'host123';
    const hostName = 'Alice';
    
    const gameId = await gameService.createGame(hostId, hostName);
    
    expect(gameId.length).toBe(6);
    expect(mockDB[`games/${gameId}`]).toBeDefined();
    expect(mockDB[`games/${gameId}`].state).toBe('lobby');

    const guesserId = 'guesser456';
    const guesserName = 'Bob';
    mockDB[`games/${gameId}`] = { ...mockDB[`games/${gameId}`], players: [hostId] };
    await gameService.joinGame(gameId, guesserId, guesserName, false);
    
    expect(mockDB[`games/${gameId}/players/${guesserId}`]).toBeDefined();
    
    for (let i = 1; i <= 10; i++) {
        mockDB[`games/${gameId}/players/${hostId}/cards/card${i}`] = { text: `Card ${i}`, source: 'Alice' };
    }

    mockDB[`games/${gameId}/players/${hostId}`] = { id: hostId, score: 0 };
    mockDB[`games/${gameId}/players/${guesserId}`] = { id: guesserId, score: 0 };
    await gameService.startGame(gameId, false);
    
    const gameDoc = mockDB[`games/${gameId}`];
    expect(gameDoc.state).toBe('playing');
    expect(gameDoc.players).toHaveLength(2);
    expect(gameDoc.currentRound).toBe(1);
    expect(gameDoc.roundPhase).toBe('ranking');
    expect(gameDoc.playAreaCards).toHaveLength(5);

    const firstRanker = gameDoc.rankerId;
    const initialDeckSize = gameDoc.deck.length;

    await gameService.updateRankerRankings(gameId, [5, 4, 3, 2, 1]);
    expect(mockDB[`games/${gameId}`].rankerRankings).toEqual([5, 4, 3, 2, 1]);
    
    await gameService.confirmRankings(gameId);
    expect(mockDB[`games/${gameId}`].roundPhase).toBe('guessing');

    await gameService.updateGuesserRankings(gameId, [5, 4, 3, 2, 1]);
    await gameService.confirmGuesses(gameId);
    expect(mockDB[`games/${gameId}`].roundPhase).toBe('revealing');

    await gameService.revealRanking(gameId, 1);
    expect(mockDB[`games/${gameId}`].revealedRankings).toContain(1);

    await gameService.finishRound(gameId);
    expect(mockDB[`games/${gameId}`].roundPhase).toBe('round_end');

    await gameService.startNextRound(
      gameId,
      firstRanker,
      5,
      gameDoc.deck,
      gameDoc.discard || [],
      gameDoc.playAreaCards,
      gameDoc.players,
      gameDoc.currentRound
    );

    const nextGameDoc = mockDB[`games/${gameId}`];
    expect(nextGameDoc.currentRound).toBe(2);
    expect(nextGameDoc.roundPhase).toBe('ranking');
    expect(nextGameDoc.deck.length).toBeLessThan(initialDeckSize);

    const nextRanker = nextGameDoc.rankerId;
    await gameService.endGameFromRound(gameId, nextRanker, 3);
    
    expect(mockDB[`games/${gameId}`].state).toBe('results');
    expect(mockDB[`games/${gameId}/players/${firstRanker}`].score).toBe(5);
    expect(mockDB[`games/${gameId}/players/${nextRanker}`].score).toBe(3);
  });
});
