import type { Game, PlayerData } from '../services/gameService';
import { updateRankerRankings, confirmRankings, updateGuesserRankings, confirmGuesses, revealRanking, finishRound } from '../services/gameService';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableCard } from './SortableCard';
import { useState } from 'react';

interface GameBoardProps {
  game: Game;
  players: PlayerData[];
  myPlayerId: string;
}

export default function GameBoard({ game, myPlayerId }: GameBoardProps) {
  const isRanker = game.rankerId === myPlayerId;
  const isRankingPhase = game.roundPhase === 'ranking';
  
  // Local state for ranker handling smooth drag animations
  const [rankerItems, setRankerItems] = useState(game.rankerRankings);
  const [prevGameRankings, setPrevGameRankings] = useState(game.rankerRankings);

  if (game.rankerRankings !== prevGameRankings) {
    setPrevGameRankings(game.rankerRankings);
    setRankerItems(game.rankerRankings);
  }

  // Local state for guesser handling smooth drag animations
  const [guesserItems, setGuesserItems] = useState(game.guesserRankings);
  const [prevGuesserRankings, setPrevGuesserRankings] = useState(game.guesserRankings);

  if (game.guesserRankings !== prevGuesserRankings) {
    setPrevGuesserRankings(game.guesserRankings);
    setGuesserItems(game.guesserRankings);
  }

  // Determine visibility
  // If it's the ranking phase, ONLY the ranker can see the cards.
  // In later phases, everyone will see them.
  const canSeeDeck = isRanker || !isRankingPhase;
  const isGuessingPhase = game.roundPhase === 'guessing';
  const isRevealingPhase = game.roundPhase === 'revealing';
  const isRoundEndPhase = game.roundPhase === 'round_end';

  // Determine layout for sortable context
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleRankerDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    if (active.id !== over.id) {
      const oldIndex = rankerItems.indexOf(Number(active.id));
      const newIndex = rankerItems.indexOf(Number(over.id));
      
      const newArray = arrayMove(rankerItems, oldIndex, newIndex);
      setRankerItems(newArray); // Optimistic UI
      
      await updateRankerRankings(game.id, newArray);
    }
  };

  const handleGuesserDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    if (active.id !== over.id) {
      const oldIndex = guesserItems.indexOf(Number(active.id));
      const newIndex = guesserItems.indexOf(Number(over.id));
      
      const newArray = arrayMove(guesserItems, oldIndex, newIndex);
      setGuesserItems(newArray); // Optimistic UI
      
      await updateGuesserRankings(game.id, newArray);
    }
  };

  const getSubtext = () => {
    if (isRankingPhase) {
      return isRanker 
        ? "Drag the Ranker numbers to show what you think is Great (1) vs Hate (5)"
        : "Waiting for Ranker to rank...";
    }
    if (isGuessingPhase) {
      return !isRanker
        ? "Work together to order the Guesser numbers to match the Ranker's thoughts!"
        : "Waiting for Guessers to finalize their guesses...";
    }
    if (isRevealingPhase) {
      return isRanker
        ? "Reveal your ranking one by one"
        : "Ranker is revealing their answers...";
    }
    if (isRoundEndPhase) {
      const correct = game.rankerRankings.filter((val, idx) => val === game.guesserRankings[idx]).length;
      const incorrect = 5 - correct;
      return `Round Over! Score: ${correct - incorrect}`;
    }
    return "";
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-2">Round {game.currentRound}</h1>
      <div className="text-center mb-8">
        <p className="text-lg font-semibold">
          {isRanker 
            ? "It's your turn to rank!" 
            : "It's the Guessers' turn!"}
        </p>
        <p className="text-sm text-gray-400 mt-1 max-w-lg mx-auto">
          {getSubtext()}
        </p>
      </div>

      {/* RANKER BUTTONS */}
      {isRanker && isRankingPhase && (
        <div className="mb-4">
          <button 
            className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2 px-8 rounded-full shadow-lg transition-transform active:scale-95"
            onClick={() => confirmRankings(game.id)}
          >
            Done Ranking!
          </button>
        </div>
      )}

      {/* GUESSER BUTTONS */}
      {!isRanker && isGuessingPhase && (
        <div className="mb-4 flex flex-col items-center gap-2">
          <button 
            className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2 px-8 rounded-full shadow-lg transition-transform active:scale-95"
            onClick={() => {
              if (window.confirm("Are you sure you're ready to guess?")) {
                confirmGuesses(game.id);
              }
            }}
          >
            Guess!
          </button>
        </div>
      )}

      {/* REVEAL BUTTONS */}
      {isRanker && isRevealingPhase && (game.revealedRankings.length === 5) && (
        <div className="mb-4">
          <button 
            className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2 px-8 rounded-full shadow-lg transition-transform active:scale-95"
            onClick={() => finishRound(game.id)}
          >
            Finish the round
          </button>
        </div>
      )}

      {/* END ROUND BUTTONS */}
      {isRoundEndPhase && (
        <div className="mb-4 flex gap-4">
          <button 
            className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2 px-8 rounded-full shadow-lg transition-transform active:scale-95"
            onClick={() => {
              // TODO: Next round dispatch logic
            }}
          >
            Another round
          </button>
          <button 
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-8 rounded-full shadow-lg transition-transform active:scale-95"
            onClick={() => {
              // TODO: End game logic
            }}
          >
            End the game
          </button>
        </div>
      )}

      {/* Main Board Container */}
      <div className="flex flex-row md:flex-col items-start md:items-center justify-center gap-4 md:gap-8 w-full max-w-6xl mt-4">
        
        {/* RANKER CARDS */}
        <div className="flex flex-col items-center">
          <div className="text-center font-bold text-xs md:text-sm text-gray-400 mb-2">Ranker</div>
          
          <DndContext collisionDetection={closestCenter} onDragEnd={handleRankerDragEnd}>
            <SortableContext 
              items={rankerItems} 
              strategy={isMobile ? verticalListSortingStrategy : horizontalListSortingStrategy}
            >
              <div className="flex flex-col md:flex-row gap-4 items-center">
                {rankerItems.map((num) => {
                  const isRevealed = game.revealedRankings?.includes(num);
                  const showNumber = canSeeDeck || isRevealed || isRoundEndPhase;
                  
                  return (
                    <SortableCard 
                      key={`ranker-${num}`} 
                      id={num}
                      disabled={!isRanker || !isRankingPhase}
                      className={`bg-primary-600 h-24 md:h-16 w-16 md:w-32 flex items-center justify-center font-bold rounded-lg shrink-0 z-10 
                        ${(isRevealingPhase && isRanker && !isRevealed) ? 'cursor-pointer hover:ring-4 ring-white ring-opacity-50' : ''}`}
                    >
                      {/* For revealing, ranker clicks */}
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        onClick={() => {
                          if (isRanker && isRevealingPhase && !isRevealed) {
                            revealRanking(game.id, num);
                          }
                        }}
                      >
                        {showNumber ? num : '?'}
                      </div>
                    </SortableCard>
                  )
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* DECK CARDS */}
        <div className="flex flex-col items-center">
          <div className="text-center font-bold text-xs md:text-sm text-gray-400 mb-2">Cards</div>
          <div className="flex flex-col md:flex-row gap-4 items-center relative">
            {game.playAreaCards.map((card, idx) => (
              <div 
                key={`deck-${idx}`} 
                data-testid={!canSeeDeck ? "hidden-deck-card" : `deck-card-${card.id}`}
                className="bg-white text-gray-900 h-24 md:h-32 w-24 md:w-32 flex items-center justify-center font-semibold rounded-lg p-2 text-center text-xs md:text-sm shadow-md shrink-0 z-10"
              >
                {canSeeDeck || isGuessingPhase || isRevealingPhase || isRoundEndPhase ? card.text : 'Great to Hate'}
              </div>
            ))}
          </div>
        </div>

        {/* GUESSER CARDS */}
        <div className="flex flex-col items-center">
          <div className="text-center font-bold text-xs md:text-sm text-gray-400 mb-2">Guesser</div>
          
          <DndContext collisionDetection={closestCenter} onDragEnd={handleGuesserDragEnd}>
            <SortableContext 
              items={guesserItems} 
              strategy={isMobile ? verticalListSortingStrategy : horizontalListSortingStrategy}
            >
              <div className="flex flex-col md:flex-row gap-4 items-center">
                {guesserItems.map((num) => {
                  return (
                    <SortableCard 
                      key={`guesser-${num}`} 
                      id={num}
                      disabled={isRanker || !isGuessingPhase}
                      className="bg-gray-700 border border-gray-600 text-white h-24 md:h-16 w-16 md:w-32 flex items-center justify-center font-bold rounded-lg shrink-0 z-10"
                    >
                      {num}
                    </SortableCard>
                  )
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>

      </div>
    </div>
  );
}