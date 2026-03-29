import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PlayerLobby from './PlayerLobby';
import type { Card, PlayerData } from '../services/gameService';

describe('PlayerLobby Component', () => {
  const mockCards: Card[] = [];
  const mockPlayers: PlayerData[] = [
    { id: '1', name: 'Alice', gameId: 'ABCDEF', score: 0, isHost: false, cardCount: 0 },
    { id: '2', name: 'Bob', gameId: 'ABCDEF', score: 0, isHost: false, cardCount: 0 }
  ];

  it('renders players list and add card button', () => {
    const onAddCard = vi.fn();
    render(
      <PlayerLobby 
        cards={mockCards} 
        players={mockPlayers} 
        myPlayerId="2"
        onAddCard={onAddCard}
        onUpdateCard={vi.fn()}
        onRemoveCard={vi.fn()}
        onUpdateName={vi.fn()}
      />
    );
    
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add a card/i })).toBeInTheDocument();
  });

  it('disables add button when 10 cards are present', () => {
    const tenCards = Array.from({ length: 10 }).map((_, i) => ({
      id: String(i), text: `Card ${i}`, source: '1'
    }));

    render(
      <PlayerLobby 
        cards={tenCards} 
        players={mockPlayers} 
        myPlayerId="2"
        onAddCard={vi.fn()}
        onUpdateCard={vi.fn()}
        onRemoveCard={vi.fn()}
        onUpdateName={vi.fn()}
      />
    );

    const addBtn = screen.getByRole('button', { name: /add a card/i });
    expect(addBtn).toBeDisabled();
  });

  it('shows remove modal when clicking card X', () => {
    const cards = [{ id: '100', text: 'Bad idea', source: '1' }];
    render(
      <PlayerLobby 
        cards={cards} 
        players={mockPlayers} 
        myPlayerId="2"
        onAddCard={vi.fn()}
        onUpdateCard={vi.fn()}
        onRemoveCard={vi.fn()}
        onUpdateName={vi.fn()}
      />
    );

    const removeBtn = screen.getByRole('button', { name: /remove card/i });
    fireEvent.click(removeBtn);
    
    expect(screen.getByText(/remove this card\?/i)).toBeInTheDocument();
  });
});
