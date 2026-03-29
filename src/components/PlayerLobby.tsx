import { useState, useRef, useEffect } from 'react';
import { X, Plus, Users, Lightbulb } from 'lucide-react';
import type { Card, PlayerData } from '../services/gameService';
import EditableName from './EditableName';

interface PlayerLobbyProps {
  cards: Card[];
  players: PlayerData[];
  myPlayerId: string;
  onAddCard: (text: string) => void;
  onUpdateCard: (cardId: string, newText: string) => void;
  onRemoveCard: (cardId: string) => void;
  onUpdateName: (newName: string) => void;
}

export default function PlayerLobby({ cards, players, myPlayerId, onAddCard, onUpdateCard, onRemoveCard, onUpdateName }: PlayerLobbyProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleAddCard = () => {
    if (cards.length < 10) {
      onAddCard(''); 
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen max-w-6xl mx-auto p-4 gap-6">
      
      {/* Sidebar: Players and Hints */}
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        
        {/* Players List */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Users className="text-primary-500" /> Players
          </h2>
          <ul className="space-y-2">
            {players.map(p => {
              const isMe = p.id === myPlayerId;
              return (
                <li key={p.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                  <span className="flex items-center gap-2">
                    <EditableName name={p.name} isMe={isMe} onSave={onUpdateName} />
                    {p.isHost && <span className="text-xs bg-primary-600 px-2 py-1 rounded">Host</span>}
                    {isMe && <span className="text-xs bg-green-600 px-2 py-1 rounded text-white">You</span>}
                  </span>
                  <span className="text-sm text-gray-400">{p.cardCount || 0} cards</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Hints */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md flex-1">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-yellow-400">
            <Lightbulb size={20} /> Tips for Great Cards
          </h2>
          <p className="text-sm text-gray-300 mb-3 leading-relaxed">
            Choose things people will have a strong and varying opinion on. The game is called <strong className="text-white">Great to Hate</strong>, after all!
          </p>
          <div className="space-y-2 text-sm text-gray-300">
            <p><span className="text-green-400 font-bold">Good:</span> pineapple on pizza, foggy days, SNL, specific pop stars, anime...</p>
            <p><span className="text-red-400 font-bold">Bad:</span> tap water, trees, sidewalks, screaming children.</p>
          </div>
          <p className="text-xs text-gray-400 mt-4 italic border-t border-gray-700 pt-3">
            Note: it's better to not make these about real people that the players know, unless you have clear agreement on that. It's no fun hating on real people without their consent.
          </p>
        </div>
      </div>

      {/* Main Area: Cards */}
      <div className="w-full md:w-2/3 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primary-500">Your Cards ({cards.length}/10)</h2>
          <button 
            onClick={handleAddCard}
            disabled={cards.length >= 10}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-bold transition-colors"
          >
            <Plus size={20} /> Add a card
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {cards.map(card => (
            <CardItem 
              key={card.id} 
              card={card} 
              onUpdate={(text) => onUpdateCard(card.id, text)} 
              onRemoveRequest={() => setDeleteConfirmId(card.id)}
            />
          ))}
          {cards.length === 0 && (
            <div className="text-center text-gray-500 py-10 italic">
              No cards added yet. Click &quot;Add a card&quot; to start!
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-2xl max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Remove this card?</h3>
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  onRemoveCard(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded font-bold transition-colors"
              >
                Remove
              </button>
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function CardItem({ card, onUpdate, onRemoveRequest }: { card: Card, onUpdate: (text: string) => void, onRemoveRequest: () => void }) {
  const [text, setText] = useState(card.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (card.text === '') {
      inputRef.current?.focus();
    }
  }, [card.text]);

  const handleSave = () => {
    if (text !== card.text) {
      onUpdate(text);
    }
  };

  return (
    <div className="relative group bg-gray-900 border border-gray-700 rounded-lg p-2 flex items-center">
      <input
        ref={inputRef}
        type="text"
        maxLength={50}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.blur()}
        placeholder="Enter card text..."
        className="w-full bg-transparent p-2 text-white outline-none focus:ring-2 focus:ring-primary-500 rounded"
      />
      <button 
        onClick={onRemoveRequest}
        aria-label="Remove card"
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 shadow-md"
      >
        <X size={14} />
      </button>
    </div>
  );
}
