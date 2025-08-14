import React, { useState, useCallback, useEffect } from 'react';
import { GameState, TransactionResult } from './types/game';
import { initializeGameState, buyGood, sellGood, travelToTown, saveGameState, hasSavedGame, getSaveGameInfo, deleteSavedGame, createNewGameState } from './utils/gameLogic';
import GameDashboard from './components/GameDashboard';
import TravelView from './components/TravelView';
import SummaryScreen from './components/SummaryScreen';
import StartScreen from './components/StartScreen';

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showTravelView, setShowTravelView] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Initialize game on mount
  useEffect(() => {
    const hasGame = hasSavedGame();
    if (hasGame) {
      // If there's a saved game, show the start screen to let user choose
      setGameStarted(false);
    } else {
      // If no saved game, start fresh
      setGameState(initializeGameState());
      setGameStarted(true);
    }
  }, []);

  const showMessage = useCallback((msg: string, duration: number = 3000) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), duration);
  }, []);

  const handleBuy = useCallback((goodId: string, quantity: number) => {
    if (!gameState) return;
    
    setGameState(prevState => {
      if (!prevState) return null;
      const newState = { ...prevState };
      const result: TransactionResult = buyGood(newState, goodId, quantity);
      
      if (result.success) {
        showMessage(result.message);
        saveGameState(newState);
        return newState;
      } else {
        showMessage(result.message);
        return prevState;
      }
    });
  }, [showMessage, gameState]);

  const handleSell = useCallback((goodId: string, quantity: number) => {
    if (!gameState) return;
    
    setGameState(prevState => {
      if (!prevState) return null;
      const newState = { ...prevState };
      const result: TransactionResult = sellGood(newState, goodId, quantity);
      
      if (result.success) {
        showMessage(result.message);
        saveGameState(newState);
        return newState;
      } else {
        showMessage(result.message);
        return prevState;
      }
    });
  }, [showMessage, gameState]);

  const handleTravel = useCallback(() => {
    setShowTravelView(true);
  }, []);

  const handleSelectTown = useCallback((townId: string) => {
    if (!gameState) return;
    
    setGameState(prevState => {
      if (!prevState) return null;
      const newState = { ...prevState };
      travelToTown(newState, townId);
      saveGameState(newState);
      return newState;
    });
    setShowTravelView(false);
  }, [gameState]);

  const handleCancelTravel = useCallback(() => {
    setShowTravelView(false);
  }, []);

  const handleSave = useCallback(() => {
    if (gameState) {
      saveGameState(gameState);
      showMessage('Game saved successfully!');
    }
  }, [gameState, showMessage]);

  const handleRestart = useCallback(() => {
    deleteSavedGame();
    setGameState(createNewGameState());
    setShowTravelView(false);
    setMessage(null);
    setGameStarted(true);
  }, []);

  const handleNewGame = useCallback(() => {
    deleteSavedGame();
    setGameState(createNewGameState());
    setGameStarted(true);
  }, []);

  const handleContinueGame = useCallback(() => {
    setGameState(initializeGameState());
    setGameStarted(true);
  }, []);

  // Show start screen if game hasn't started
  if (!gameStarted) {
    return (
      <StartScreen
        hasSavedGame={hasSavedGame()}
        saveInfo={getSaveGameInfo()}
        onNewGame={handleNewGame}
        onContinueGame={handleContinueGame}
      />
    );
  }

  // Show loading if gameState is not ready
  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

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
        onSave={handleSave}
        onRestart={handleRestart}
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