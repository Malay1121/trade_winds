import React from 'react';
import { motion } from 'framer-motion';
import { GameState } from '../types/game';
import { calculateScore } from '../utils/gameLogic';
import { Trophy, Star, Coins, TrendingUp, RotateCcw } from 'lucide-react';

interface SummaryScreenProps {
  gameState: GameState;
  onRestart: () => void;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({ gameState, onRestart }) => {
  const score = calculateScore(gameState);
  const profit = gameState.gold - 1000;
  const turnsUsed = gameState.turn - 1;
  
  const getTitle = () => {
    if (gameState.gameStatus === 'won') {
      return 'Victory!';
    } else if (gameState.gold >= gameState.targetGold) {
      return 'Success!';
    } else if (profit > 0) {
      return 'Profit Made!';
    } else {
      return 'Journey Complete';
    }
  };

  const getSubtitle = () => {
    if (gameState.gameStatus === 'won') {
      return 'You reached your target and became a master merchant!';
    } else if (gameState.gold >= gameState.targetGold) {
      return 'You achieved your financial goal!';
    } else if (profit > 0) {
      return 'A successful trading venture, but room for improvement.';
    } else {
      return 'Every merchant learns from their journeys.';
    }
  };

  const getScoreRating = () => {
    if (score >= 6000) return { label: 'Legendary Merchant', color: 'text-purple-600', stars: 5 };
    if (score >= 5000) return { label: 'Master Trader', color: 'text-gold-600', stars: 4 };
    if (score >= 3000) return { label: 'Skilled Merchant', color: 'text-blue-600', stars: 3 };
    if (score >= 2000) return { label: 'Apprentice Trader', color: 'text-green-600', stars: 2 };
    return { label: 'Novice Merchant', color: 'text-gray-600', stars: 1 };
  };

  const rating = getScoreRating();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-2xl w-full border-2 border-amber-200"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-4 w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center"
          >
            <Trophy className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-4xl font-bold text-gray-800 font-serif mb-2"
          >
            {getTitle()}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-gray-600 text-lg"
          >
            {getSubtitle()}
          </motion.p>
        </div>

        {/* Score and Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 mb-6 border border-amber-200"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600 mb-2">
              {score.toLocaleString()} Points
            </div>
            <div className={`text-xl font-semibold ${rating.color} mb-2`}>
              {rating.label}
            </div>
            <div className="flex justify-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < rating.stars
                      ? 'text-amber-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <Coins className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {gameState.gold.toLocaleString()}g
            </div>
            <div className="text-sm text-gray-600">Final Gold</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <TrendingUp className={`w-8 h-8 mx-auto mb-2 ${
              profit >= 0 ? 'text-green-500' : 'text-red-500'
            }`} />
            <div className={`text-2xl font-bold ${
              profit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {profit >= 0 ? '+' : ''}{profit.toLocaleString()}g
            </div>
            <div className="text-sm text-gray-600">Profit/Loss</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-800 mx-auto mb-2">
              {turnsUsed}/{gameState.maxTurns}
            </div>
            <div className="text-sm text-gray-600">Turns Used</div>
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="text-center"
        >
          <button
            onClick={onRestart}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto"
          >
            <RotateCcw className="w-5 h-5" />
            Start New Journey
          </button>
        </motion.div>

        {/* Achievement Messages */}
        {gameState.gameStatus === 'won' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-center"
          >
            <div className="text-green-700 font-semibold">
              🎉 Achievement Unlocked: Master Merchant! 🎉
            </div>
            <div className="text-green-600 text-sm mt-1">
              You reached {gameState.targetGold} gold in {turnsUsed} turns!
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SummaryScreen;