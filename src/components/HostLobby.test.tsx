import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HostLobby from './HostLobby';

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe('HostLobby Component', () => {
  it('renders the game code and copy button', () => {
    render(<HostLobby gameId="ABCDEF" players={[]} customCardsCount={0} myPlayerId="1" />);
    
    expect(screen.getByText('ABCDEF')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('shows waiting message when no other players', () => {
    render(<HostLobby gameId="ABCDEF" players={[{ id: '1', name: 'Host', cardCount: 0, isHost: true, gameId: 'ABCDEF', score: 0 }]} customCardsCount={0} myPlayerId="1" />);
    
    expect(screen.getByText(/waiting for player\(s\)/i)).toBeInTheDocument();
  });

  it('displays the players table, toggle, and start button', () => {
    render(
      <HostLobby 
        gameId="ABCDEF" 
        players={[{ id: '1', name: 'Host', cardCount: 0, isHost: true, gameId: 'ABCDEF', score: 0 }, { id: '2', name: 'Bob', cardCount: 5, isHost: false, gameId: 'ABCDEF', score: 0 }]} 
        customCardsCount={5} 
        myPlayerId="1"
      />
    );
    
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText(/include default cards/i)).toBeInTheDocument();
    
    // Start button should be disabled because customCards is 5 and default is maybe off (needs 25 total)
    const startBtn = screen.getByRole('button', { name: /start game/i });
    expect(startBtn).toBeDisabled();
  });
});
