import React from 'react';
import { motion } from 'framer-motion';
import { GameState } from '../types/game';
import { towns } from '../data/towns';
import { MapPin, Coins, Package, Clock } from 'lucide-react';
import MarketTable from './MarketTable';
import InventoryPanel from './InventoryPanel';
import EventLog from './EventLog';

interface GameDashboardProps {
  gameState: GameState;
  onBuy: (goodId: string, quantity: number) => void;
  onSell: (goodId: string, quantity: number) => void;
  onTravel: () => void;
}

const GameDashboard: React.FC<GameDashboardProps> = ({
  gameState,
  onBuy,
  onSell,
  onTravel
}) => {
  const currentTown = towns.find(t => t.id === gameState.currentTownId)!;
  const progressPercentage = (gameState.turn / gameState.maxTurns) * 100;
  const cargoPercentage = (gameState.currentCargo / gameState.cargoLimit) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-6 border-2 border-amber-200"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="text-amber-600 w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800 font-serif">
                  {currentTown.name}
                </h1>
                <p className="text-gray-600 text-sm">{currentTown.description}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Coins className="text-yellow-600 w-5 h-5" />
                <span className="font-semibold text-lg">{gameState.gold} Gold</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="text-blue-600 w-5 h-5" />
                <span>
                  Cargo: {gameState.currentCargo}/{gameState.cargoLimit}
                  <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${cargoPercentage}%` }}
                    />
                  </div>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="text-red-600 w-5 h-5" />
                <span>
                  Turn {gameState.turn}/{gameState.maxTurns}
                  <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Market and Travel */}
          <div className="lg:col-span-2 space-y-6">
            <MarketTable
              gameState={gameState}
              onBuy={onBuy}
              onSell={onSell}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-amber-200"
            >
              <h3 className="text-xl font-bold text-gray-800 font-serif mb-4">
                Travel
              </h3>
              <p className="text-gray-600 mb-4">
                Ready to explore new markets? Each journey takes one turn.
              </p>
              <button
                onClick={onTravel}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Choose Destination
              </button>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <InventoryPanel gameState={gameState} />
            <EventLog gameState={gameState} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDashboard;