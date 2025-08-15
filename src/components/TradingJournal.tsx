import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, TrendingUp, BarChart3, MapPin, Calendar, Coins, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { GameState } from '../types/game';
import { calculateRouteAnalysis, calculateTradingStats } from '../utils/gameLogic';
import { goods } from '../data/goods';
import { towns } from '../data/towns';

interface TradingJournalProps {
  gameState: GameState;
  onClose: () => void;
}

type TabType = 'trades' | 'routes' | 'statistics';

export const TradingJournal: React.FC<TradingJournalProps> = ({ gameState, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('trades');
  const routeAnalysis = calculateRouteAnalysis(gameState);
  const tradingStats = calculateTradingStats(gameState);


  const getGoodName = (goodId: string) => {
    const good = goods.find(g => g.id === goodId);
    return good ? good.name : goodId;
  };

  const getTownName = (townId: string) => {
    const town = towns.find(t => t.id === townId);
    return town ? town.name : townId;
  };

  const formatSeason = (season: string) => {
    return season.charAt(0).toUpperCase() + season.slice(1);
  };

  const formatProfitability = (profit: number) => {
    if (profit > 0) {
      return (
        <span className="text-green-400 flex items-center gap-1">
          <ArrowUpRight className="w-4 h-4" />
          +{profit.toFixed(0)}g
        </span>
      );
    } else if (profit < 0) {
      return (
        <span className="text-red-400 flex items-center gap-1">
          <ArrowDownRight className="w-4 h-4" />
          {profit.toFixed(0)}g
        </span>
      );
    }
    return <span className="text-gray-400">0g</span>;
  };

  const renderTradesTab = () => {
    const sortedTrades = [...gameState.tradingJournal].reverse();
    
    return (
      <div className="space-y-4">
        <div className="text-center text-gray-400">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-amber-400" />
          <h3 className="text-lg font-semibold text-amber-200 mb-1">Trading History</h3>
          <p className="text-sm">Complete record of all your trades</p>
        </div>
        
        <div className="max-h-96 overflow-y-auto space-y-2">
          {sortedTrades.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No trades recorded yet</p>
              <p className="text-sm">Start trading to see your history here</p>
            </div>
          ) : (
            sortedTrades.map((trade) => (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 rounded-lg p-3 border border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      trade.type === 'buy' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {trade.type === 'buy' ? '📦' : '💰'}
                    </div>
                    <div>
                      <div className="font-medium text-amber-200">
                        {trade.type === 'buy' ? 'Bought' : 'Sold'} {trade.quantity}x {getGoodName(trade.goodId)}
                      </div>
                      <div className="text-sm text-gray-400 flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {getTownName(trade.townId)}
                        <Calendar className="w-3 h-3 ml-2" />
                        Turn {trade.turn} • {formatSeason(trade.season)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-amber-200">
                      {trade.pricePerUnit}g each
                    </div>
                    <div className="text-sm text-gray-400">
                      Total: {trade.totalValue.toFixed(0)}g
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderRoutesTab = () => {
    return (
      <div className="space-y-4">
        <div className="text-center text-gray-400">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-amber-400" />
          <h3 className="text-lg font-semibold text-amber-200 mb-1">Route Analysis</h3>
          <p className="text-sm">Profitability analysis for trade routes</p>
        </div>
        
        <div className="max-h-96 overflow-y-auto space-y-3">
          {Object.entries(routeAnalysis).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No route data available</p>
              <p className="text-sm">Complete some buy-sell cycles to see route analysis</p>
            </div>
          ) : (
            Object.entries(routeAnalysis).map(([key, analysis]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium text-amber-200 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      {getGoodName(analysis.goodId)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {getTownName(analysis.fromTown)} → {getTownName(analysis.toTown)}
                    </div>
                  </div>
                  <div className="text-right">
                    {formatProfitability(analysis.profit)}
                    <div className="text-sm text-gray-400">total profit</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Buy Price</div>
                    <div className="text-amber-200 font-medium">{analysis.buyPrice.toFixed(0)}g</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Sell Price</div>
                    <div className="text-amber-200 font-medium">{analysis.sellPrice.toFixed(0)}g</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Quantity</div>
                    <div className="text-amber-200 font-medium">{analysis.quantity}</div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Profit Margin:</span>
                    <span className="text-amber-200">{analysis.profitMargin.toFixed(1)}%</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderStatisticsTab = () => {
    return (
      <div className="space-y-4">
        <div className="text-center text-gray-400">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 text-amber-400" />
          <h3 className="text-lg font-semibold text-amber-200 mb-1">Trading Statistics</h3>
          <p className="text-sm">Your overall trading performance</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 text-center">
            <Coins className="w-6 h-6 mx-auto mb-2 text-amber-400" />
            <div className="text-2xl font-bold text-amber-200">
              {formatProfitability(tradingStats.netProfit)}
            </div>
            <div className="text-sm text-gray-400">Net Profit</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 text-center">
            <Package className="w-6 h-6 mx-auto mb-2 text-amber-400" />
            <div className="text-2xl font-bold text-amber-200">{tradingStats.totalTrades}</div>
            <div className="text-sm text-gray-400">Total Trades</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-amber-200 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Best Goods
            </h4>
            <div className="space-y-2">
              {Object.entries(tradingStats.tradesByGood)
                .sort(([,a], [,b]) => (b.profit as number) - (a.profit as number))
                .slice(0, 5)
                .map(([goodId, stats]) => (
                  <div key={goodId} className="flex justify-between items-center bg-gray-800/30 rounded px-3 py-2">
                    <span className="text-amber-200">{getGoodName(goodId)}</span>
                    {formatProfitability(stats.profit)}
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-amber-200 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Best Towns
            </h4>
            <div className="space-y-2">
              {Object.entries(tradingStats.tradesByTown)
                .sort(([,a], [,b]) => (b.profit as number) - (a.profit as number))
                .slice(0, 5)
                .map(([townId, stats]) => (
                  <div key={townId} className="flex justify-between items-center bg-gray-800/30 rounded px-3 py-2">
                    <span className="text-amber-200">{getTownName(townId)}</span>
                    {formatProfitability(stats.profit)}
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-amber-200 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Best Seasons
            </h4>
            <div className="space-y-2">
              {Object.entries(tradingStats.tradesBySeason)
                .sort(([,a], [,b]) => (b.profit as number) - (a.profit as number))
                .map(([season, stats]) => (
                  <div key={season} className="flex justify-between items-center bg-gray-800/30 rounded px-3 py-2">
                    <span className="text-amber-200">{formatSeason(season)}</span>
                    {formatProfitability(stats.profit)}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'trades' as const, label: 'Trade History', icon: BookOpen },
    { id: 'routes' as const, label: 'Routes', icon: TrendingUp },
    { id: 'statistics' as const, label: 'Statistics', icon: BarChart3 }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-xl border border-amber-600/30 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-amber-400" />
                <h2 className="text-2xl font-bold text-amber-200">Trading Journal</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-amber-600/20 text-amber-200 border border-amber-600/30'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'trades' && renderTradesTab()}
                {activeTab === 'routes' && renderRoutesTab()}
                {activeTab === 'statistics' && renderStatisticsTab()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
