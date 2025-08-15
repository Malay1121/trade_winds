import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, TownReputation } from '../types/game';
import { getTownReputation } from '../utils/gameLogic';
import { towns } from '../data/towns';
import { X, Star, Skull, Heart, Crown, Shield, AlertTriangle } from 'lucide-react';

interface ReputationPanelProps {
  gameState: GameState;
  onClose: () => void;
}

const ReputationPanel: React.FC<ReputationPanelProps> = ({ gameState, onClose }) => {
  const getStatusIcon = (status: TownReputation['status']) => {
    switch (status) {
      case 'blacklisted': return <Skull className="w-5 h-5 text-red-600" />;
      case 'poor': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'neutral': return <Shield className="w-5 h-5 text-gray-600" />;
      case 'good': return <Heart className="w-5 h-5 text-green-600" />;
      case 'excellent': return <Star className="w-5 h-5 text-blue-600" />;
      case 'vip': return <Crown className="w-5 h-5 text-purple-600" />;
      default: return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: TownReputation['status']) => {
    switch (status) {
      case 'blacklisted': return 'text-red-600 bg-red-50';
      case 'poor': return 'text-orange-600 bg-orange-50';
      case 'neutral': return 'text-gray-600 bg-gray-50';
      case 'good': return 'text-green-600 bg-green-50';
      case 'excellent': return 'text-blue-600 bg-blue-50';
      case 'vip': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusDescription = (status: TownReputation['status']) => {
    switch (status) {
      case 'blacklisted': return 'Banned from trading premium goods';
      case 'poor': return 'Higher prices, limited access';
      case 'neutral': return 'Standard trading conditions';
      case 'good': return '10% discount on all goods';
      case 'excellent': return '20% discount + rare gems access';
      case 'vip': return '30% discount + all exclusive goods';
      default: return 'Standard trading conditions';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
        >
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Reputation Status</h2>
              <p className="text-purple-100">Your standing across all towns</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-lg">
                <Crown className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-gray-800">
                  Global Reputation: {gameState.reputation.globalReputation}
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {towns.map(town => {
                const reputation = getTownReputation(gameState, town.id);
                const isCurrentTown = town.id === gameState.currentTownId;
                
                return (
                  <motion.div
                    key={town.id}
                    className={`border rounded-lg p-4 ${
                      isCurrentTown ? 'ring-2 ring-amber-400 border-amber-200' : 'border-gray-200'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">{town.name}</h3>
                        {isCurrentTown && (
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                            Current
                          </span>
                        )}
                      </div>
                      {getStatusIcon(reputation.status)}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(reputation.status)}`}>
                          {reputation.status.charAt(0).toUpperCase() + reputation.status.slice(1)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Points:</span>
                        <span className="text-sm font-medium">{reputation.points}/100</span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            reputation.points >= 0 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.abs(reputation.points)}%`,
                            marginLeft: reputation.points < 0 ? `${100 - Math.abs(reputation.points)}%` : '0'
                          }}
                        />
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        {getStatusDescription(reputation.status)}
                      </p>

                      {reputation.exclusiveGoodsAccess.length > 0 && (
                        <div className="mt-3 p-2 bg-purple-50 rounded">
                          <p className="text-xs text-purple-800 font-medium">Exclusive Access:</p>
                          <p className="text-xs text-purple-600">
                            {reputation.exclusiveGoodsAccess.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {gameState.reputation.reputationEvents.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Reputation Changes</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {gameState.reputation.reputationEvents
                    .slice(-10)
                    .reverse()
                    .map(event => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">
                            {towns.find(t => t.id === event.townId)?.name}
                          </span>
                          <span className="text-gray-600">{event.action}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            event.pointsChanged > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {event.pointsChanged > 0 ? '+' : ''}{event.pointsChanged}
                          </span>
                          <span className="text-xs text-gray-500">Turn {event.timestamp}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReputationPanel;
