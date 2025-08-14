import React, { useState, useCallback } from 'react';
import { GameState, TransactionResult } from './types/game';
import { initializeGameState, buyGood, sellGood, travelToTown } from './utils/gameLogic';
import GameDashboard from './components/GameDashboard';
import TravelView from './components/TravelView';
import SummaryScreen from './components/SummaryScreen';

function App() {
  const [gameState, setGameState] = useState<GameState>(initializeGameState);
  const [showTravelView, setShowTravelView] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const showMessage = useCallback((msg: string, duration: number = 3000) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), duration);
  }, []);

  const handleBuy = useCallback((goodId: string, quantity: number) => {
    setGameState(prevState => {
      const newState = { ...prevState };
      const result: TransactionResult = buyGood(newState, goodId, quantity);
      
      if (result.success) {
        showMessage(result.message);
        return newState;
      } else {
        showMessage(result.message);
        return prevState;
      }
    });
  }, [showMessage]);

  const handleSell = useCallback((goodId: string, quantity: number) => {
    setGameState(prevState => {
      const newState = { ...prevState };
      const result: TransactionResult = sellGood(newState, goodId, quantity);
      
      if (result.success) {
        showMessage(result.message);
        return newState;
      } else {
        showMessage(result.message);
        return prevState;
      }
    });
  }, [showMessage]);

  const handleTravel = useCallback(() => {
    setShowTravelView(true);
  }, []);

  const handleSelectTown = useCallback((townId: string) => {
    setGameState(prevState => {
      const newState = { ...prevState };
      travelToTown(newState, townId);
      return newState;
    });
    setShowTravelView(false);
  }, []);

  const handleCancelTravel = useCallback(() => {
    setShowTravelView(false);
  }, []);

  const handleRestart = useCallback(() => {
    setGameState(initializeGameState());
    setShowTravelView(false);
    setMessage(null);
  }, []);

  // Check if game should end
  if (gameState.gameStatus !== 'playing') {
    return (
      <SummaryScreen 
        gameState={gameState} 
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="relative">
      {/* Message Toast */}
      {message && (
        <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm border border-amber-200 text-gray-800 px-4 py-2 rounded-lg shadow-lg">
          {message}
        </div>
      )}

      <GameDashboard
        gameState={gameState}
        onBuy={handleBuy}
        onSell={handleSell}
        onTravel={handleTravel}
      />

      {showTravelView && (
        <TravelView
          gameState={gameState}
          onSelectTown={handleSelectTown}
          onCancel={handleCancelTravel}
        />
      )}
    </div>
  );
}

export default App;