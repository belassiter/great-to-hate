import type { PlayerData, Game } from '../services/gameService';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface GameResultsProps {
  game: Game;
  players: PlayerData[];
  myPlayerId: string;
}

export default function GameResults({ game, players, myPlayerId }: GameResultsProps) {
  const navigate = useNavigate();
  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const highestScore = sortedPlayers[0]?.score || 0;
  
  const isHost = game.hostId === myPlayerId;

  const handleNewGame = async () => {
    // navigate home or back to lobby
    // If just returning to lobby, change the game state. For ease, we can let them create a new game
    navigate('/');
  };

  const handleReturnToLobby = async () => {
    const gameRef = doc(db, 'games', game.id);
    await updateDoc(gameRef, { state: 'lobby', currentRound: 0 });
    // Keep cards logic inside host to restart or wipe them.
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4 mt-10">Game Results</h1>
      
      {highestScore > 0 && sortedPlayers[0] && (
        <h2 className="text-2xl font-bold text-center text-yellow-400 mb-8">
          👑📖 {sortedPlayers[0].name}, you are the most open book! 📖👑
        </h2>
      )}

      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-2xl border border-gray-700">
        <h2 className="text-xl text-center text-primary-400 mb-6 font-semibold">Final Open Book Scores</h2>
        
        <div className="flex flex-col gap-3 mb-8">
          {sortedPlayers.map((p, idx) => {
            const isWinner = (p.score || 0) === highestScore && highestScore > 0;
            return (
              <div 
                key={p.id} 
                className={`flex justify-between items-center px-4 py-3 rounded-md ${
                  isWinner ? 'bg-primary-900 border border-primary-500' : 'bg-gray-700'
                }`}
              >
                <span className={`font-semibold ${isWinner ? 'text-white font-bold' : 'text-gray-200'}`}>
                  {idx + 1}. {p.name}
                  {p.id === myPlayerId && (
                    <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full inline-block">You</span>
                  )}
                </span>
                <span className={`text-xl ${isWinner ? 'font-bold text-white' : 'font-semibold text-gray-300'}`}>
                  {p.score || 0}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          <button 
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform active:scale-95"
            onClick={handleNewGame}
          >
            New Game
          </button>
          
          {isHost && (
            <button 
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform active:scale-95"
              onClick={handleReturnToLobby}
            >
              Return to Lobby
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
