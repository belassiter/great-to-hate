import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAnonymously } from '../services/auth';
import { createGame, joinGame } from '../services/gameService';

export default function Home() {
  const [gameId, setGameId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    try {
      setIsProcessing(true);
      setError('');
      const user = await loginAnonymously();
      const newGameId = await createGame(user.uid, 'Host');
      navigate(`/host/${newGameId}`);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to create game');
      setIsProcessing(false);
    }
  };

  const handleJoin = async () => {
    if (gameId.length !== 6 || name.trim().length === 0) {
      setError('Please enter a valid 6-character Game ID and a Name.');
      return;
    }
    try {
      setIsProcessing(true);
      setError('');
      const user = await loginAnonymously();
      await joinGame(gameId, user.uid, name.trim());
      navigate(`/lobby/${gameId}`);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to join game');
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8 text-primary-500">Great to Hate</h1>
      
      <div className="w-full max-w-md bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
        {error && <div className="mb-4 text-red-400 text-center font-semibold bg-red-900/50 py-2 rounded">{error}</div>}
        
        {/* Tabs */}
        <div className="flex mb-6 border-b border-gray-700">
          <button className="flex-1 py-2 text-center border-b-2 border-primary-500 text-primary-500 font-bold">
            Remote
          </button>
          <button className="flex-1 py-2 text-center text-gray-500 cursor-not-allowed" disabled>
            Local (Coming Soon)
          </button>
        </div>

        {/* Create Game Section */}
        <div className="mb-8 p-4 bg-gray-900 rounded-lg text-center">
          <h2 className="text-lg font-semibold mb-2">Host a Game</h2>
          <button 
            disabled={isProcessing}
            onClick={handleCreate}
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
          >
            Create Private Game
          </button>
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink-0 mx-4 text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        {/* Join Game Section */}
        <div className="p-4 bg-gray-900 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-center">Join a Game</h2>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Enter Game ID" 
              maxLength={6}
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 uppercase focus:outline-none focus:border-primary-500"
              value={gameId}
              onChange={(e) => setGameId(e.target.value.toUpperCase())}
            />
            <input 
              type="text" 
              placeholder="Name" 
              maxLength={15}
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button 
              disabled={isProcessing}
              onClick={handleJoin}
              className="w-full bg-white text-gray-900 hover:bg-gray-200 font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
