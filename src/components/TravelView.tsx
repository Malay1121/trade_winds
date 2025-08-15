import React from 'react';
import { motion } from 'framer-motion';
import { towns } from '../data/towns';
import { GameState } from '../types/game';
import { MapPin, ArrowRight, Star } from 'lucide-react';

interface TravelViewProps {
  gameState: GameState;
  onSelectTown: (townId: string) => void;
  onCancel: () => void;
}

const TravelView: React.FC<TravelViewProps> = ({ gameState, onSelectTown, onCancel }) => {
  const currentTown = towns.find(t => t.id === gameState.currentTownId)!;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-b from-amber-50 to-orange-100 rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 font-serif mb-2">
            Choose Your Destination
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Currently in <span className="font-semibold text-amber-600">{currentTown.name}</span>
            • Turn {gameState.turn}/{gameState.maxTurns}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {towns.map((town, index) => {
            const isCurrentTown = town.id === gameState.currentTownId;
            
            return (
              <motion.div
                key={town.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-4 sm:p-6 rounded-xl border-2 transition-all cursor-pointer ${
                  isCurrentTown
                    ? 'bg-amber-100 border-amber-400 cursor-default'
                    : 'bg-white/80 border-amber-200 hover:border-amber-400 hover:shadow-lg transform hover:scale-105'
                }`}
                onClick={() => !isCurrentTown && onSelectTown(town.id)}
              >
                {isCurrentTown && (
                  <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    Current
                  </div>
                )}

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`p-2 sm:p-3 rounded-lg ${
                    isCurrentTown ? 'bg-amber-200' : 'bg-amber-100'
                  }`}>
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 font-serif mb-2">
                      {town.name}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-3 leading-relaxed">
                      {town.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500" />
                        <span className="text-xs text-gray-600 font-medium">
                          Specializes in:
                        </span>
                      </div>
                      {town.specialties.map(specialty => (
                        <span
                          key={specialty}
                          className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>

                    {!isCurrentTown && (
                      <div className="mt-4 flex items-center text-amber-600 text-sm font-semibold">
                        <span>Travel Here</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 sm:py-3 sm:px-8 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
          >
            Stay in {currentTown.name}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TravelView;
