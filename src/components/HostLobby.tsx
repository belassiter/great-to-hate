import { useState } from 'react';
import { Copy, X } from 'lucide-react';
import type { PlayerData } from '../services/gameService';
import EditableName from './EditableName';

interface HostLobbyProps {
  gameId: string;
  players: PlayerData[];
  customCardsCount: number;
  myPlayerId: string;
  onKickPlayer?: (id: string) => void;
  onStartGame?: (includeDefaults: boolean) => void;
  onUpdateName?: (newName: string) => void;
}

export default function HostLobby({ gameId, players, customCardsCount, myPlayerId, onKickPlayer, onStartGame, onUpdateName }: HostLobbyProps) {
  const [includeDefaults, setIncludeDefaults] = useState(false);
  const otherPlayers = players.filter(p => !p.isHost);
  
  // We know defaults add 25 right now (based on default-cards.txt lines)
  const canStart = (includeDefaults ? (customCardsCount + 25 >= 25) : customCardsCount >= 25) && players.length >= 2;

  const handleCopy = () => {
    navigator.clipboard.writeText(gameId);
  };

  const sortedPlayers = [...players].sort((a, b) => {
    if (a.isHost) return -1;
    if (b.isHost) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col items-center p-4 max-w-2xl mx-auto min-h-screen">
      <h1 className="text-3xl font-bold text-primary-500 mb-6">Host Lobby</h1>
      
      <div className="bg-gray-800 p-6 rounded-xl w-full border border-gray-700 shadow-md mb-6 text-center">
        <h2 className="text-gray-400 mb-2 uppercase tracking-wide text-sm font-semibold">Game Code</h2>
        <div className="flex items-center justify-center space-x-4">
          <span className="text-5xl font-mono tracking-widest font-bold">{gameId}</span>
          <button 
            onClick={handleCopy}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            title="Copy Game Code"
          >
            <Copy size={24} />
          </button>
        </div>
      </div>

      <div className="w-full mb-6">
        <h3 className="text-xl font-semibold mb-3">Players</h3>
        {otherPlayers.length === 0 && (
          <p className="text-gray-400 italic mb-4">Waiting for player(s)...</p>
        )}
        
        <div className="max-h-64 overflow-y-auto mb-4 bg-gray-800 rounded-lg border border-gray-700">
          <table className="w-full text-left">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="p-3 font-semibold">#</th>
                <th className="p-3 font-semibold">Name</th>
                <th className="p-3 font-semibold text-center">Cards</th>
                <th className="p-3 font-semibold text-center">Kick</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((p, i) => {
                const isMe = p.id === myPlayerId;
                return (
                  <tr key={p.id} className="border-b border-gray-700 last:border-0 hover:bg-gray-750">
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3 flex items-center gap-2">
                       <EditableName name={p.name} isMe={isMe} onSave={val => onUpdateName?.(val)} />
                       {p.isHost && <span className="text-xs bg-primary-600 px-2 py-1 rounded">Host</span>}
                    </td>
                    <td className="p-3 text-center">{p.cardCount || 0}</td>
                    <td className="p-3 text-center">
                      {!p.isHost && (
                        <button 
                          onClick={() => onKickPlayer?.(p.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                          aria-label={`Kick ${p.name}`}
                        >
                          <X size={20} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="w-full bg-gray-800 p-6 rounded-xl border border-gray-700">
        <p className="mb-4 text-center">Total number of custom cards created: <span className="font-bold text-xl">{customCardsCount}</span></p>
        
        {/* Toggle */}
        <div className="flex items-center justify-between mb-6 bg-gray-900 p-4 rounded-lg">
          <span className="font-medium">Include default cards</span>
          <button 
            role="switch"
            aria-checked={includeDefaults}
            onClick={() => setIncludeDefaults(!includeDefaults)}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${includeDefaults ? 'bg-primary-500' : 'bg-gray-600'}`}
          >
            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${includeDefaults ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="group relative">
          <button 
            disabled={!canStart}
            onClick={() => onStartGame?.(includeDefaults)}
            className="w-full py-4 text-lg font-bold rounded bg-primary-600 hover:bg-primary-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Start Game
          </button>
          
          {/* Tooltip for disabled state */}
          {!canStart && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-3/4 bg-gray-900 text-sm text-center px-3 py-2 rounded border border-gray-700 z-10 shadow-lg">
              {players.length < 2 
                ? "Need at least 2 players to start."
                : "Need at least 25 cards. Consider toggling default cards."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
