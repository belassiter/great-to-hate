import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from './Home';
import * as authService from '../services/auth';
import * as gameService from '../services/gameService';
import type { User } from 'firebase/auth';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../services/auth');
vi.mock('../services/gameService');

describe('Home Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Remote tab by default and has Create Private Game button', () => {
    render(<Home />);
    expect(screen.getByText(/Remote/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create private game/i })).toBeInTheDocument();
  });

  it('renders Join Game section with Game ID and Name inputs', () => {
    render(<Home />);
    expect(screen.getByPlaceholderText(/enter game id/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join game/i })).toBeInTheDocument();
  });

  it('creates a game and navigates to host lobby', async () => {
    vi.spyOn(authService, 'loginAnonymously').mockResolvedValue({ uid: 'user123' } as User);
    vi.spyOn(gameService, 'createGame').mockResolvedValue('NEWGAME');

    render(<Home />);
    
    const createBtn = screen.getByRole('button', { name: /create private game/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(authService.loginAnonymously).toHaveBeenCalled();
      expect(gameService.createGame).toHaveBeenCalledWith('user123', 'Host');
      expect(mockNavigate).toHaveBeenCalledWith('/host/NEWGAME');
    });
  });

  it('joins a game and navigates to player lobby', async () => {
    vi.spyOn(authService, 'loginAnonymously').mockResolvedValue({ uid: 'joiner123' } as User);
    vi.spyOn(gameService, 'joinGame').mockResolvedValue();

    render(<Home />);
    
    const gameIdInput = screen.getByPlaceholderText(/enter game id/i);
    const nameInput = screen.getByPlaceholderText(/name/i);
    const joinBtn = screen.getByRole('button', { name: /join game/i });

    fireEvent.change(gameIdInput, { target: { value: 'ABCDEF' } });
    fireEvent.change(nameInput, { target: { value: 'Alice' } });
    fireEvent.click(joinBtn);

    await waitFor(() => {
      expect(authService.loginAnonymously).toHaveBeenCalled();
      expect(gameService.joinGame).toHaveBeenCalledWith('ABCDEF', 'joiner123', 'Alice');
      expect(mockNavigate).toHaveBeenCalledWith('/lobby/ABCDEF');
    });
  });
});
