import React from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Save } from 'lucide-react';

interface StartScreenProps {
  hasSavedGame: boolean;
  saveInfo: { savedAt: string } | null;
  onNewGame: () => void;
  onContinueGame: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({
  hasSavedGame,
  saveInfo,
  onNewGame,
  onContinueGame
}) => {
  const formatSaveDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full border-2 border-amber-200"
      >
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-gray-800 font-serif mb-2"
          >
            Trade Winds
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600"
          >
            Merchant Trading Adventure
          </motion.p>
        </div>

        <div className="space-y-4">
          {hasSavedGame && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button
                onClick={onContinueGame}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
              >
                <Play className="w-5 h-5" />
                Continue Game
              </button>
              {saveInfo && (
                <div className="text-center mt-2">
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                    <Save className="w-4 h-4" />
                    <span>Saved: {formatSaveDate(saveInfo.savedAt)}</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: hasSavedGame ? 0.5 : 0.4 }}
          >
            <button
              onClick={onNewGame}
              className={`w-full font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3 ${
                hasSavedGame
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
              }`}
            >
              <RotateCcw className="w-5 h-5" />
              {hasSavedGame ? 'New Game' : 'Start Game'}
            </button>
            {hasSavedGame && (
              <div className="text-center mt-2">
                <span className="text-xs text-gray-500">
                  This will overwrite your saved game
                </span>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>
            Build a trading empire across four towns.
            <br />
            Navigate seasons, events, and market changes.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StartScreen;
