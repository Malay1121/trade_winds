import React from 'react';
import { motion } from 'framer-motion';
import { GameState } from '../types/game';
import { goods } from '../data/goods';
import { Package, Target, TrendingUp } from 'lucide-react';

interface InventoryPanelProps {
  gameState: GameState;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ gameState }) => {
  const inventoryItems = goods
    .map(good => ({
      ...good,
      quantity: gameState.inventory[good.id] || 0
    }))
    .filter(item => item.quantity > 0);

  const inventoryValue = inventoryItems.reduce(
    (total, item) => total + (item.quantity * item.basePrice * 0.8),
    0
  );

  const progressToTarget = (gameState.gold / gameState.targetGold) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-amber-200"
    >
      <div className="flex items-center gap-2 mb-4">
        <Package className="text-blue-600 w-6 h-6" />
        <h3 className="text-xl font-bold text-gray-800 font-serif">Inventory</h3>
      </div>

      {/* Progress to Target */}
      <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
        <div className="flex items-center gap-2 mb-2">
          <Target className="text-amber-600 w-5 h-5" />
          <span className="font-semibold text-gray-800">Goal Progress</span>
        </div>
        <div className="text-sm text-gray-600 mb-2">
          {gameState.gold} / {gameState.targetGold} Gold ({Math.round(progressToTarget)}%)
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressToTarget, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Cargo Space */}
      <div className="mb-4 text-sm">
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-600">Cargo Space</span>
          <span className="font-semibold">
            {gameState.currentCargo}/{gameState.cargoLimit}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${(gameState.currentCargo / gameState.cargoLimit) * 100}%` }}
          />
        </div>
      </div>

      {/* Inventory Items */}
      <div className="space-y-3">
        {inventoryItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Your cargo hold is empty</p>
            <p className="text-xs">Buy goods to start trading!</p>
          </div>
        ) : (
          inventoryItems.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border"
            >
              <div>
                <div className="font-semibold text-gray-800">{item.name}</div>
                <div className="text-xs text-gray-500">
                  Est. value: {Math.round(item.quantity * item.basePrice * 0.8)}g
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-600">{item.quantity}</div>
                <div className="text-xs text-gray-500">units</div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {inventoryItems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-amber-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">Total Est. Value:</span>
            </div>
            <span className="font-semibold text-green-600">
              {Math.round(inventoryValue)}g
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default InventoryPanel;
