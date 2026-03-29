import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HelpModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 bg-primary-800 text-white rounded-full hover:bg-primary-700 shadow-md transition-colors"
          title="How to Play"
        >
          <HelpCircle size={24} />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-primary-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-white space-y-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-3xl font-bold">Great to Hate</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-primary-700 rounded-md transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4 text-primary-100">
                  <section>
                    <h3 className="text-xl font-semibold text-white mb-2">Purpose</h3>
                    <p>
                      Test your knowledge of other players! Find out who is an "Open Book" and who is a complete mystery.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-xl font-semibold text-white mb-2">Phases of the Game</h3>
                    
                    <div className="bg-primary-900/50 p-3 rounded-lg">
                      <h4 className="font-bold text-white">Setup & Lobby</h4>
                      <p className="text-sm">Players collaborate to create a deck of cards by writing down different things (prompts, objects, ideas). These are shuffled to form the game deck.</p>
                    </div>

                    <div className="bg-primary-900/50 p-3 rounded-lg">
                      <h4 className="font-bold text-white">Ranking</h4>
                      <p className="text-sm">The active "Ranker" is dealt 5 cards from the deck. They must secretly order these cards from best (1) to worst (5) based on their own personal preference.</p>
                    </div>

                    <div className="bg-primary-900/50 p-3 rounded-lg">
                      <h4 className="font-bold text-white">Guessing</h4>
                      <p className="text-sm">All other players (the "Guessers") work together to guess the Ranker's exact order. They drag and drop the same 5 cards to match what they believe the Ranker chose.</p>
                    </div>

                    <div className="bg-primary-900/50 p-3 rounded-lg">
                      <h4 className="font-bold text-white">Reveal & End of Round (Scoring)</h4>
                      <p className="text-sm">The Ranker reveals their true ranking one by one. Points (Open Book Scores) are awarded to the Ranker based on how accurately the Guessers predicted their choices (Correct placements minus incorrect placements). Once finished, the next round begins with a new Ranker.</p>
                    </div>
                  </section>

                  <section className="pt-4 border-t border-primary-700 space-y-2">
                    <h3 className="text-lg font-semibold text-white">Links & Info</h3>
                    <p className="text-sm">
                      <a 
                        href="https://github.com/belassiter/great-to-hate" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-accent-400 hover:text-accent-300 underline"
                      >
                        GitHub Repository
                      </a>
                    </p>
                    <p className="text-sm">
                      <a 
                        href="https://github.com/belassiter/great-to-hate/blob/main/LICENSE" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-accent-400 hover:text-accent-300 underline"
                      >
                        GPLv3 License
                      </a>
                    </p>
                  </section>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}