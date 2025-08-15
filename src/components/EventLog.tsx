import React from 'react';
import { motion } from 'framer-motion';
import { GameState } from '../types/game';
import { Scroll, Globe, MapPin, Leaf } from 'lucide-react';

interface EventLogProps {
  gameState: GameState;
}

const EventLog: React.FC<EventLogProps> = ({ gameState }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 sm:p-6 border border-amber-200"
    >
      <div className="flex items-center gap-2 mb-4">
        <Scroll className="text-amber-600 w-5 h-5 sm:w-6 sm:h-6" />
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 font-serif">Recent Events</h3>
      </div>

      {/* Active Events */}
      {gameState.activeEvents.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Active Effects
          </h4>
          <div className="space-y-2">
            {gameState.activeEvents.map((event, index) => (
              <motion.div
                key={`${event.id}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-3 border rounded-lg ${
                  event.type === 'seasonal'
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                    : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {event.type === 'global' && (
                    <Globe className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  )}
                  {event.type === 'local' && (
                    <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  )}
                  {event.type === 'seasonal' && (
                    <Leaf className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold text-sm text-gray-800">
                      {event.title}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {event.duration} turn{event.duration !== 1 ? 's' : ''} remaining
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Event History */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Recent History
        </h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {gameState.eventLog.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">Your journey has just begun...</p>
            </div>
          ) : (
            gameState.eventLog.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded text-xs sm:text-sm text-gray-700"
              >
                {event.startsWith('[Global]') && (
                  <Globe className="w-3 h-3 text-red-500 inline mr-2" />
                )}
                {event.includes('[') && !event.startsWith('[Global]') && !event.startsWith('🎪') && (
                  <MapPin className="w-3 h-3 text-orange-500 inline mr-2" />
                )}
                {event.startsWith('🎪') && (
                  <Leaf className="w-3 h-3 text-purple-500 inline mr-2" />
                )}
                {event}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EventLog;
