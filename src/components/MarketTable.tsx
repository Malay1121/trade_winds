import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GameState } from '../types/game';
import { goods } from '../data/goods';
import { towns } from '../data/towns';
import { TrendingUp, TrendingDown, Minus, Plus, ShoppingCart, DollarSign } from 'lucide-react';

interface MarketTableProps {
  gameState: GameState;
  onBuy: (goodId: string, quantity: number) => void;
  onSell: (goodId: string, quantity: number) => void;
}

const MarketTable: React.FC<MarketTableProps> = ({ gameState, onBuy, onSell }) => {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  
  const currentTown = towns.find(t => t.id === gameState.currentTownId)!;
  const marketData = gameState.marketPrices[gameState.currentTownId];

  const handleQuantityChange = (goodId: string, delta: number) => {
    const current = quantities[goodId] || 1;
    const newQuantity = Math.max(1, Math.min(50, current + delta));
    setQuantities({ ...quantities, [goodId]: newQuantity });
  };

  const getQuantity = (goodId: string) => quantities[goodId] || 1;

  const getTrendIcon = (goodId: string) => {
    const townModifier = currentTown.priceModifiers[goodId] || 1.0;
    if (townModifier < 0.9) {
      return <TrendingDown className="w-4 h-4 text-green-500" title="Good price here!" />;
    } else if (townModifier > 1.1) {
      return <TrendingUp className="w-4 h-4 text-red-500" title="Expensive here" />;
    }
    return <Minus className="w-4 h-4 text-gray-400" title="Average price" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-amber-200 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-3 sm:p-4 lg:p-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold font-serif">
          {currentTown.name} Market
        </h2>
        <p className="text-amber-100 mt-1 text-xs sm:text-sm">
          Specializes in: {currentTown.specialties.join(', ')}
        </p>
      </div>

      <div className="p-3 sm:p-4 lg:p-6">
        {/* Mobile Card Layout */}
        <div className="block md:hidden space-y-3">
          {goods.map((good, index) => {
            const price = marketData[good.id];
            const quantity = getQuantity(good.id);
            const owned = gameState.inventory[good.id] || 0;
            
            return (
              <motion.div
                key={good.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800 text-lg">{good.name}</span>
                    {getTrendIcon(good.id)}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">You own</div>
                    <div className="font-bold text-blue-600">{owned}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Buy Price</div>
                    <div className="font-semibold text-green-600">{price.buy}g</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Sell Price</div>
                    <div className="font-semibold text-orange-600">{price.sell}g</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Available</div>
                    <div className="font-semibold text-gray-700">{price.available}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Quantity</div>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(good.id, -1)}
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(good.id, 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => onBuy(good.id, quantity)}
                    disabled={
                      price.available < quantity ||
                      gameState.gold < price.buy * quantity ||
                      gameState.currentCargo + quantity > gameState.cargoLimit
                    }
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm px-3 py-2 rounded-md flex items-center justify-center gap-1 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Buy ({price.buy * quantity}g)
                  </button>
                  <button
                    onClick={() => onSell(good.id, Math.min(quantity, owned))}
                    disabled={owned < quantity}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm px-3 py-2 rounded-md flex items-center justify-center gap-1 transition-colors"
                  >
                    <DollarSign className="w-4 h-4" />
                    Sell ({price.sell * Math.min(quantity, owned)}g)
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-amber-200">
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Good</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">Trend</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-700">Buy</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-700">Sell</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">Available</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">Quantity</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {goods.map((good, index) => {
                const price = marketData[good.id];
                const quantity = getQuantity(good.id);
                const owned = gameState.inventory[good.id] || 0;
                
                return (
                  <motion.tr
                    key={good.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-amber-100 hover:bg-amber-50 transition-colors"
                  >
                    <td className="py-4 px-2">
                      <div>
                        <div className="font-semibold text-gray-800">{good.name}</div>
                        <div className="text-xs text-gray-500">{good.description}</div>
                        {owned > 0 && (
                          <div className="text-xs text-blue-600 font-medium">
                            You own: {owned}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-center">
                      {getTrendIcon(good.id)}
                    </td>
                    <td className="py-4 px-2 text-right font-semibold text-green-600">
                      {price.buy}g
                    </td>
                    <td className="py-4 px-2 text-right font-semibold text-orange-600">
                      {price.sell}g
                    </td>
                    <td className="py-4 px-2 text-center text-gray-600">
                      {price.available}
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(good.id, -1)}
                          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-bold"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(good.id, 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-bold"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => onBuy(good.id, quantity)}
                          disabled={
                            price.available < quantity ||
                            gameState.gold < price.buy * quantity ||
                            gameState.currentCargo + quantity > gameState.cargoLimit
                          }
                          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs px-3 py-1 rounded-md flex items-center gap-1 transition-colors"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          Buy ({price.buy * quantity}g)
                        </button>
                        <button
                          onClick={() => onSell(good.id, Math.min(quantity, owned))}
                          disabled={owned < quantity}
                          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs px-3 py-1 rounded-md flex items-center gap-1 transition-colors"
                        >
                          <DollarSign className="w-3 h-3" />
                          Sell ({price.sell * Math.min(quantity, owned)}g)
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketTable;
