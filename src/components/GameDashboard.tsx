import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { GameState } from '../types/game';
import { getActiveAlerts, getTownReputation } from '../utils/gameLogic';
import { towns } from '../data/towns';
import { seasons } from '../data/seasons';
import { MapPin, Coins, Package, Clock, Save, RotateCcw, Menu, BookOpen, Bell, Star } from 'lucide-react';
import MarketTable from './MarketTable';
import InventoryPanel from './InventoryPanel';
import EventLog from './EventLog';
import { TradingJournal } from './TradingJournal';
import MarketAlerts from './MarketAlerts';
import ReputationPanel from './ReputationPanel';

interface GameDashboardProps {
  gameState: GameState;
  onBuy: (goodId: string, quantity: number) => void;
  onSell: (goodId: string, quantity: number) => void;
  onTravel: () => void;
  onSave: () => void;
  onRestart: () => void;
  onUpdateGameState: (newState: GameState) => void;
}

const GameDashboard: React.FC<GameDashboardProps> = ({
  gameState,
  onBuy,
  onSell,
  onTravel,
  onSave,
  onRestart,
  onUpdateGameState
}) => {
  const currentTown = towns.find(t => t.id === gameState.currentTownId)!;
  const currentSeasonData = seasons.find(s => s.id === gameState.currentSeason)!;
  const currentReputation = getTownReputation(gameState, gameState.currentTownId);
  const progressPercentage = (gameState.turn / gameState.maxTurns) * 100;
  const cargoPercentage = (gameState.currentCargo / gameState.cargoLimit) * 100;
  const { alerts, opportunities, news } = getActiveAlerts(gameState);
  const totalAlerts = alerts.length + opportunities.length + news.length;
  const [showMenu, setShowMenu] = useState(false);
  const [showTradingJournal, setShowTradingJournal] = useState(false);
  const [showMarketAlerts, setShowMarketAlerts] = useState(false);
  const [showReputationPanel, setShowReputationPanel] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  

  const seasonEmojis = {
    spring: '🌱',
    summer: '☀️', 
    autumn: '🍂',
    winter: '❄️'
  };
  
  const seasonEmoji = seasonEmojis[gameState.currentSeason as keyof typeof seasonEmojis] || '🌍';


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      

      if (showMenu && 
          buttonRef.current && !buttonRef.current.contains(target) &&
          dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleSave = () => {
    console.log('handleSave called');
    onSave();
    setShowMenu(false);
  };

  const handleRestart = () => {
    console.log('handleRestart called');
    if (confirm('Are you sure you want to restart? This will start a new game and overwrite your current progress.')) {
      onRestart();
      setShowMenu(false);
    }
  };

  const handleMenuToggle = () => {
    console.log('handleMenuToggle called');
    if (!showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        x: rect.right - 160,
        y: rect.bottom + 8
      });
    }
    setShowMenu(!showMenu);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 border-2 border-amber-200"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="text-amber-600 w-6 h-6 sm:w-8 sm:h-8" />
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 font-serif">
                  {currentTown.name}
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">{currentTown.description}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
              <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-3 sm:gap-4 lg:gap-6 text-sm flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg">{seasonEmoji}</span>
                  <span className="min-w-0">
                    <div className="truncate">{currentSeasonData.name}</div>
                    <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                      {gameState.seasonTurn}/{currentSeasonData.duration} turns
                    </div>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="text-yellow-600 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="font-semibold text-sm sm:text-lg min-w-0">
                    <div className="truncate">{gameState.gold} Gold</div>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="text-purple-600 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="min-w-0">
                    <div className="truncate text-xs sm:text-sm">Rep: {currentReputation.status}</div>
                    <div className="text-xs text-gray-500">
                      {currentReputation.points > 0 ? '+' : ''}{currentReputation.points}
                    </div>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="min-w-0">
                    <div className="truncate">Cargo: {gameState.currentCargo}/{gameState.cargoLimit}</div>
                    <div className="w-16 sm:w-20 h-2 bg-gray-200 rounded-full mt-1">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${cargoPercentage}%` }}
                      />
                    </div>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="text-red-600 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="min-w-0">
                    <div className="truncate">Turn {gameState.turn}/{gameState.maxTurns}</div>
                    <div className="w-16 sm:w-20 h-2 bg-gray-200 rounded-full mt-1">
                      <div
                        className="h-full bg-red-500 rounded-full transition-all"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </span>
                </div>
              </div>

              {/* Game Menu */}
              <div className="relative" ref={menuRef} style={{ zIndex: 10000 }}>
                <button
                  ref={buttonRef}
                  onClick={handleMenuToggle}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors relative flex-shrink-0"
                  title="Game Menu"
                >
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                  {totalAlerts > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center"
                      style={{ fontSize: '10px' }}
                    >
                      {totalAlerts > 9 ? '9+' : totalAlerts}
                    </span>
                  )}
                </button>

                {showMenu && createPortal(
                  <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[160px]"
                    style={{ 
                      position: 'fixed',
                      zIndex: 10000,
                      left: `${menuPosition.x}px`,
                      top: `${menuPosition.y}px`
                    }}
                  >
                    <button
                      onClick={() => {
                        console.log('Trading Journal button clicked');
                        setShowTradingJournal(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-amber-600" />
                      Trading Journal
                    </button>
                    <button
                      onClick={() => {
                        setShowMarketAlerts(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors relative"
                    >
                      <Bell className="w-4 h-4 text-blue-600" />
                      Market Alerts
                      {totalAlerts > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                          {totalAlerts > 99 ? '99+' : totalAlerts}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowReputationPanel(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                    >
                      <Star className="w-4 h-4 text-purple-600" />
                      Reputation
                    </button>
                    <button
                      onClick={handleSave}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                    >
                      <Save className="w-4 h-4 text-green-600" />
                      Save Game
                    </button>
                    <button
                      onClick={handleRestart}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-red-600" />
                      Restart Game
                    </button>
                  </motion.div>,
                  document.body
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Market and Travel */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <MarketTable
              gameState={gameState}
              onBuy={onBuy}
              onSell={onSell}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 sm:p-6 border border-amber-200"
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 font-serif mb-4">
                Travel
              </h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Ready to explore new markets? Each journey takes one turn.
              </p>
              <button
                onClick={onTravel}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Choose Destination
              </button>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            <InventoryPanel gameState={gameState} />
            <EventLog gameState={gameState} />
          </div>
        </div>
        
        {/* Trading Journal Modal */}
        {showTradingJournal && (
          <TradingJournal
            gameState={gameState}
            onClose={() => setShowTradingJournal(false)}
          />
        )}

        {/* Market Alerts Modal */}
        {showMarketAlerts && (
          <MarketAlerts
            gameState={gameState}
            onClose={() => setShowMarketAlerts(false)}
            onUpdateGameState={onUpdateGameState}
          />
        )}

        {/* Reputation Panel Modal */}
        {showReputationPanel && (
          <ReputationPanel
            gameState={gameState}
            onClose={() => setShowReputationPanel(false)}
          />
        )}
      </div>
    </div>
  );
};

export default GameDashboard;
