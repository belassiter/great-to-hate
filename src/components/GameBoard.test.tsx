import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GameBoard from './GameBoard';
import type { Game, PlayerData } from '../services/gameService';

const mockGame: Game = {
  id: 'ABC',
  hostId: 'host1',
  state: 'playing',
  players: ['player1', 'host1'],
  includeDefaults: true,
  deck: [],
  discard: [],
  currentRound: 1,
  rankerId: 'player1',
  roundPhase: 'ranking',
  playAreaCards: [
    { id: '1', text: 'Card A', source: 'x' },
    { id: '2', text: 'Card B', source: 'x' },
    { id: '3', text: 'Card C', source: 'x' },
    { id: '4', text: 'Card D', source: 'x' },
    { id: '5', text: 'Card E', source: 'x' },
  ],
  rankerRankings: [1, 2, 3, 4, 5],
  guesserRankings: [1, 2, 3, 4, 5],
  revealedRankings: []
};

const mockPlayers: PlayerData[] = [
  { id: 'player1', name: 'Alice', gameId: 'ABC', score: 0, isHost: false, cardCount: 0 },
  { id: 'host1', name: 'Bob', gameId: 'ABC', score: 0, isHost: true, cardCount: 0 }
];

describe('GameBoard', () => {
  it('shows deck cards face up for the ranker during ranking phase', () => {
    // Current user is ranker
    render(<GameBoard game={mockGame} players={mockPlayers} myPlayerId="player1" />);
    
    // Ranker should see the text of Card A
    expect(screen.getByText('Card A')).toBeInTheDocument();
  });

  it('shows deck cards face down for guessers during ranking phase', () => {
    // Current user is guesser
    render(<GameBoard game={mockGame} players={mockPlayers} myPlayerId="host1" />);
    
    // Guesser should NOT see the text of Card A yet
    expect(screen.queryByText('Card A')).not.toBeInTheDocument();
    
    // But they should see that 5 blank cards are there
    const hiddenCards = screen.getAllByTestId('hidden-deck-card');
    expect(hiddenCards).toHaveLength(5);
  });
});