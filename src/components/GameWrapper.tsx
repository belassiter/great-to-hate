import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HostLobby from './HostLobby';
import PlayerLobby from './PlayerLobby';
import { subscribeToGame, subscribeToPlayers, subscribeToCards, addCard, updateCardText, removeCard, fetchAllCustomCardsCount, updatePlayerName, startGame } from '../services/gameService';
import type { Game, PlayerData, Card } from '../services/gameService';
import { subscribeToAuth } from '../services/auth';
import type { User } from 'firebase/auth';

import GameBoard from './GameBoard';
import GameResults from './GameResults';

interface GameWrapperProps {
  view: 'host' | 'player';
}

export default function GameWrapper({ view }: GameWrapperProps) {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<User | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [myCards, setMyCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Auth Subscription
  useEffect(() => {
    const unsub = subscribeToAuth((u) => {
      setUser(u);
      if (!u) {
        // If not authenticated, kick back to home
        navigate('/');
      }
    });
    return unsub;
  }, [navigate]);

  // 2. Game & Players Subscriptions
  useEffect(() => {
    if (!gameId || !user) return;

    const unsubGame = subscribeToGame(gameId, (g) => {
      if (!g) {
        navigate('/'); // Game dissolved or not found
      } else {
        setGame(g);
      }
      setLoading(false);
    });

    const unsubPlayers = subscribeToPlayers(gameId, (p) => {
      setPlayers(p);
    });

    return () => {
      unsubGame();
      unsubPlayers();
    };
  }, [gameId, user, navigate]);

  // 3. Cards Subscription (For players only)
  useEffect(() => {
    if (view === 'player' && gameId && user) {
      const unsubCards = subscribeToCards(gameId, user.uid, (cards) => {
        setMyCards(cards);
      });
      return unsubCards;
    }
  }, [view, gameId, user]);

  if (loading || !game || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading game state...</div>;
  }

  if (game.state === 'playing') {
    return <GameBoard game={game} myPlayerId={user.uid} players={players} />;
  }

  if (game.state === 'results') {
    return <GameResults game={game} myPlayerId={user.uid} players={players} />;
  }

  // --- Render logic based on view ---

  if (view === 'host') {
    // Only host should be here, technically we could check `game.hostId === user.uid`
    if (game.hostId !== user.uid) {
      return <div className="text-red-500 text-center p-10">Unauthorized: You are not the host.</div>;
    }

    const customCardsCount = fetchAllCustomCardsCount(players);

    return (
      <HostLobby 
        gameId={game.id} 
        players={players} 
        customCardsCount={customCardsCount}
        myPlayerId={user.uid}
        onUpdateName={(newName) => updatePlayerName(game.id, user.uid, newName)}
        onStartGame={(includeDefaults) => startGame(game.id, includeDefaults)}
      />
    );
  } else {
    // Player view
    return (
      <PlayerLobby 
        cards={myCards}
        players={players}
        myPlayerId={user.uid}
        onAddCard={(text) => addCard(game.id, user.uid, text)}
        onUpdateCard={(cardId, text) => updateCardText(game.id, user.uid, cardId, text)}
        onRemoveCard={(cardId) => removeCard(game.id, user.uid, cardId)}
        onUpdateName={(newName) => updatePlayerName(game.id, user.uid, newName)}
      />
    );
  }
}
