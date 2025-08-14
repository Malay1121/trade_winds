import { GameState, GameEvent, TransactionResult, TradeRecord, RouteAnalysis, TradingStats } from '../types/game';
import { towns } from '../data/towns';
import { goods } from '../data/goods';
import { gameEvents } from '../data/events';
import { seasons, seasonalFestivals } from '../data/seasons';

const SAVE_KEY = 'tradeWindsSaveGame';

export function saveGameState(state: GameState): void {
  try {
    const saveData = {
      ...state,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

export function loadGameState(): GameState | null {
  try {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      // Remove the savedAt timestamp before returning
      const { savedAt, ...gameState } = parsedData;
      return gameState as GameState;
    }
  } catch (error) {
    console.error('Failed to load game state:', error);
  }
  return null;
}

export function hasSavedGame(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function deleteSavedGame(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function getSaveGameInfo(): { savedAt: string } | null {
  try {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return { savedAt: parsedData.savedAt };
    }
  } catch (error) {
    console.error('Failed to get save game info:', error);
  }
  return null;
}

export function initializeGameState(): GameState {
  // Try to load saved game first
  const savedGame = loadGameState();
  if (savedGame) {
    // Regenerate market prices for the loaded game state
    generateMarketPrices(savedGame);
    return savedGame;
  }

  // Create new game if no save exists
  return createNewGameState();
}

export function createNewGameState(): GameState {
  const initialTown = towns[0];
  const state: GameState = {
    currentTownId: initialTown.id,
    gold: 1000,
    inventory: {},
    turn: 1,
    maxTurns: 20,
    cargoLimit: 100,
    currentCargo: 0,
    targetGold: 5000,
    gameStatus: 'playing',
    activeEvents: [],
    eventLog: [`Welcome to ${initialTown.name}! Your trading journey begins.`],
    marketPrices: {},
    currentSeason: 'spring',
    seasonTurn: 1,
    tradingJournal: [],
    pendingPurchases: {}
  };

  // Initialize inventor
  goods.forEach(good => {
    state.inventory[good.id] = 0;
  });

  // Add initial seasonal message
  const currentSeasonData = seasons.find(s => s.id === state.currentSeason)!;
  state.eventLog.unshift(`🌱 ${currentSeasonData.name} has arrived! ${currentSeasonData.description}`);

  // Generate initial market prices
  generateMarketPrices(state);
  
  return state;
}

export function generateMarketPrices(state: GameState): void {
  state.marketPrices = {};
  
  // Get current season data
  const currentSeasonData = seasons.find(s => s.id === state.currentSeason)!;
  
  towns.forEach(town => {
    state.marketPrices[town.id] = {};
    
    goods.forEach(good => {
      let basePrice = good.basePrice;
      let townModifier = town.priceModifiers[good.id] || 1.0;
      
      // Apply seasonal modifiers
      let seasonalPriceModifier = currentSeasonData.priceModifiers[good.id] || 1.0;
      let seasonalAvailabilityModifier = currentSeasonData.goodsAvailability[good.id] || 1.0;
      
      // Apply active event effects
      let eventModifier = 1.0;
      state.activeEvents.forEach(event => {
        if (event.effects[good.id]) {
          if (event.type === 'global') {
            eventModifier *= event.effects[good.id];
          } else if (event.type === 'local' && town.id === state.currentTownId) {
            eventModifier *= event.effects[good.id];
          } else if (event.type === 'seasonal') {
            eventModifier *= event.effects[good.id];
          }
        }
      });
      
      // Add some random variation (±15%)
      let randomModifier = 0.85 + Math.random() * 0.3;
      
      let finalPrice = Math.round(basePrice * townModifier * seasonalPriceModifier * eventModifier * randomModifier);
      
      // Buy price is slightly higher than sell price for the player
      let buyPrice = Math.round(finalPrice * 1.1);
      let sellPrice = Math.round(finalPrice * 0.9);
      
      // Available quantity affected by season (random between 10-50, modified by season)
      let baseAvailable = Math.floor(Math.random() * 40) + 10;
      let available = Math.round(baseAvailable * seasonalAvailabilityModifier);
      
      state.marketPrices[town.id][good.id] = {
        buy: buyPrice,
        sell: sellPrice,
        available: Math.max(1, available) // Ensure at least 1 available
      };
    });
  });
}

export function generateRandomEvent(): GameEvent | null {
  // 30% chance of no event
  if (Math.random() > 0.7) {
    return null;
  }
  
  const totalWeight = gameEvents.reduce((sum, event) => sum + event.weight, 0);
  let randomWeight = Math.random() * totalWeight;
  
  for (const event of gameEvents) {
    randomWeight -= event.weight;
    if (randomWeight <= 0) {
      return { ...event };
    }
  }
  
  return null;
}

export function generateSeasonalEvent(state: GameState): GameEvent | null {
  const currentSeasonData = seasons.find(s => s.id === state.currentSeason)!;
  
  // Check for seasonal festival based on season's festival chance
  if (Math.random() < currentSeasonData.festivalChance) {
    const seasonalEvents = seasonalFestivals.filter(event => event.season === state.currentSeason);
    if (seasonalEvents.length > 0) {
      const randomEvent = seasonalEvents[Math.floor(Math.random() * seasonalEvents.length)];
      // Convert to GameEvent format by removing the season property
      const { season, ...gameEvent } = randomEvent;
      return gameEvent as GameEvent;
    }
  }
  
  return null;
}

export function updateSeasons(state: GameState): void {
  state.seasonTurn++;
  
  const currentSeasonData = seasons.find(s => s.id === state.currentSeason)!;
  
  // Check if season should change
  if (state.seasonTurn > currentSeasonData.duration) {
    const currentIndex = seasons.findIndex(s => s.id === state.currentSeason);
    const nextIndex = (currentIndex + 1) % seasons.length;
    const nextSeason = seasons[nextIndex];
    
    state.currentSeason = nextSeason.id;
    state.seasonTurn = 1;
    
    // Add seasonal change message with appropriate emoji
    const seasonEmojis = {
      spring: '🌱',
      summer: '☀️',
      autumn: '🍂',
      winter: '❄️'
    };
    
    const emoji = seasonEmojis[nextSeason.id as keyof typeof seasonEmojis] || '🌍';
    state.eventLog.unshift(`${emoji} ${nextSeason.name} has arrived! ${nextSeason.description}`);
  }
}

// Trading Journal Functions
export function recordTrade(
  state: GameState, 
  type: 'buy' | 'sell', 
  goodId: string, 
  quantity: number, 
  pricePerUnit: number
): void {
  const good = goods.find(g => g.id === goodId)!;
  const town = towns.find(t => t.id === state.currentTownId)!;
  
  const tradeRecord: TradeRecord = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    type,
    goodId,
    goodName: good.name,
    quantity,
    pricePerUnit,
    totalValue: quantity * pricePerUnit,
    townId: state.currentTownId,
    townName: town.name,
    turn: state.turn,
    season: state.currentSeason
  };

  state.tradingJournal.push(tradeRecord);

  // For purchases, track pending purchases for profit calculation
  if (type === 'buy') {
    if (!state.pendingPurchases[goodId]) {
      state.pendingPurchases[goodId] = {
        price: pricePerUnit,
        town: state.currentTownId,
        turn: state.turn,
        season: state.currentSeason
      };
    } else {
      // Update with weighted average if we buy more of the same good
      const existingValue = state.pendingPurchases[goodId].price * (state.inventory[goodId] - quantity);
      const newValue = pricePerUnit * quantity;
      const totalQuantity = state.inventory[goodId];
      state.pendingPurchases[goodId].price = (existingValue + newValue) / totalQuantity;
    }
  }

  // Keep journal manageable (last 100 trades)
  if (state.tradingJournal.length > 100) {
    state.tradingJournal = state.tradingJournal.slice(-100);
  }
}

export function calculateRouteAnalysis(state: GameState): RouteAnalysis[] {
  const routes: RouteAnalysis[] = [];
  const sellTrades = state.tradingJournal.filter(t => t.type === 'sell');

  sellTrades.forEach(sellTrade => {
    // Find corresponding buy trade(s) for this good
    const buyTrades = state.tradingJournal.filter(t => 
      t.type === 'buy' && 
      t.goodId === sellTrade.goodId && 
      t.timestamp < sellTrade.timestamp
    );

    if (buyTrades.length > 0) {
      // Use the most recent buy trade
      const buyTrade = buyTrades[buyTrades.length - 1];
      
      const profit = (sellTrade.pricePerUnit - buyTrade.pricePerUnit) * sellTrade.quantity;
      const profitMargin = profit / buyTrade.totalValue;

      routes.push({
        fromTown: buyTrade.townName,
        toTown: sellTrade.townName,
        goodId: sellTrade.goodId,
        goodName: sellTrade.goodName,
        buyPrice: buyTrade.pricePerUnit,
        sellPrice: sellTrade.pricePerUnit,
        quantity: sellTrade.quantity,
        profit,
        profitMargin,
        turn: sellTrade.turn,
        season: sellTrade.season
      });
    }
  });

  return routes.sort((a, b) => b.profit - a.profit);
}

export function calculateTradingStats(state: GameState): TradingStats {
  const routes = calculateRouteAnalysis(state);
  const profitableRoutes = routes.filter(r => r.profit > 0);
  const lossfulRoutes = routes.filter(r => r.profit < 0);

  const totalProfit = profitableRoutes.reduce((sum, r) => sum + r.profit, 0);
  const totalLoss = Math.abs(lossfulRoutes.reduce((sum, r) => sum + r.profit, 0));
  const netProfit = totalProfit - totalLoss;

  // Calculate stats by good
  const tradesByGood: { [goodId: string]: { trades: number; profit: number; volume: number } } = {};
  routes.forEach(route => {
    if (!tradesByGood[route.goodId]) {
      tradesByGood[route.goodId] = { trades: 0, profit: 0, volume: 0 };
    }
    tradesByGood[route.goodId].trades++;
    tradesByGood[route.goodId].profit += route.profit;
    tradesByGood[route.goodId].volume += route.quantity;
  });

  // Calculate stats by town
  const tradesByTown: { [townId: string]: { trades: number; profit: number; volume: number } } = {};
  state.tradingJournal.forEach(trade => {
    if (!tradesByTown[trade.townId]) {
      tradesByTown[trade.townId] = { trades: 0, profit: 0, volume: 0 };
    }
    tradesByTown[trade.townId].trades++;
    tradesByTown[trade.townId].volume += trade.quantity;
  });

  // Add profit data from routes
  routes.forEach(route => {
    if (tradesByTown[route.fromTown]) {
      tradesByTown[route.fromTown].profit += route.profit;
    }
  });

  // Calculate stats by season
  const tradesBySeason: { [season: string]: { trades: number; profit: number; volume: number } } = {};
  routes.forEach(route => {
    if (!tradesBySeason[route.season]) {
      tradesBySeason[route.season] = { trades: 0, profit: 0, volume: 0 };
    }
    tradesBySeason[route.season].trades++;
    tradesBySeason[route.season].profit += route.profit;
    tradesBySeason[route.season].volume += route.quantity;
  });

  // Find favorite good (most traded by volume)
  let favoriteGood = null;
  let maxVolume = 0;
  Object.entries(tradesByGood).forEach(([goodId, stats]) => {
    if (stats.volume > maxVolume) {
      maxVolume = stats.volume;
      favoriteGood = goods.find(g => g.id === goodId)?.name || goodId;
    }
  });

  // Find most profitable route
  let mostProfitableRoute = null;
  if (profitableRoutes.length > 0) {
    const routeProfits: { [key: string]: number } = {};
    profitableRoutes.forEach(route => {
      const key = `${route.fromTown}-${route.toTown}`;
      routeProfits[key] = (routeProfits[key] || 0) + route.profit;
    });

    const bestRouteKey = Object.keys(routeProfits).reduce((a, b) => 
      routeProfits[a] > routeProfits[b] ? a : b
    );
    const [from, to] = bestRouteKey.split('-');
    mostProfitableRoute = { from, to, profit: routeProfits[bestRouteKey] };
  }

  return {
    totalTrades: routes.length,
    totalProfit,
    totalLoss,
    netProfit,
    bestTrade: routes.length > 0 ? routes[0] : null,
    worstTrade: routes.length > 0 ? routes[routes.length - 1] : null,
    favoriteGood,
    mostProfitableRoute,
    averageProfitPerTrade: routes.length > 0 ? netProfit / routes.length : 0,
    successfulTrades: profitableRoutes.length,
    lossfulTrades: lossfulRoutes.length,
    tradesByGood,
    tradesByTown,
    tradesBySeason
  };
}

export function buyGood(state: GameState, goodId: string, quantity: number): TransactionResult {
  const town = towns.find(t => t.id === state.currentTownId)!;
  const good = goods.find(g => g.id === goodId)!;
  const price = state.marketPrices[town.id][goodId].buy;
  const available = state.marketPrices[town.id][goodId].available;
  
  const totalCost = price * quantity;
  const cargoNeeded = quantity;
  
  if (quantity > available) {
    return { success: false, message: `Only ${available} ${good.name} available!` };
  }
  
  if (totalCost > state.gold) {
    return { success: false, message: 'Not enough gold!' };
  }
  
  if (state.currentCargo + cargoNeeded > state.cargoLimit) {
    return { success: false, message: 'Not enough cargo space!' };
  }
  
  // Execute transaction
  state.gold -= totalCost;
  state.inventory[goodId] = (state.inventory[goodId] || 0) + quantity;
  state.currentCargo += cargoNeeded;
  state.marketPrices[town.id][goodId].available -= quantity;
  
  // Record the trade in journal
  recordTrade(state, 'buy', goodId, quantity, price);
  
  return {
    success: true,
    message: `Bought ${quantity} ${good.name} for ${totalCost} gold`,
    goldChange: -totalCost,
    cargoChange: cargoNeeded
  };
}

export function sellGood(state: GameState, goodId: string, quantity: number): TransactionResult {
  const town = towns.find(t => t.id === state.currentTownId)!;
  const good = goods.find(g => g.id === goodId)!;
  const price = state.marketPrices[town.id][goodId].sell;
  
  const currentQuantity = state.inventory[goodId] || 0;
  
  if (quantity > currentQuantity) {
    return { success: false, message: `You only have ${currentQuantity} ${good.name}!` };
  }
  
  const totalEarnings = price * quantity;
  
  // Execute transaction
  state.gold += totalEarnings;
  state.inventory[goodId] -= quantity;
  state.currentCargo -= quantity;
  
  // Record the trade in journal
  recordTrade(state, 'sell', goodId, quantity, price);
  
  return {
    success: true,
    message: `Sold ${quantity} ${good.name} for ${totalEarnings} gold`,
    goldChange: totalEarnings,
    cargoChange: -quantity
  };
}

export function travelToTown(state: GameState, townId: string): void {
  state.currentTownId = townId;
  state.turn++;
  
  // Update seasons
  updateSeasons(state);
  
  // Process active events (reduce duration)
  state.activeEvents = state.activeEvents
    .map(event => ({ ...event, duration: event.duration - 1 }))
    .filter(event => event.duration > 0);
  
  // Generate new regular event
  const newEvent = generateRandomEvent();
  if (newEvent) {
    state.activeEvents.push(newEvent);
    const town = towns.find(t => t.id === townId)!;
    
    if (newEvent.type === 'global') {
      state.eventLog.unshift(`[Global] ${newEvent.title}: ${newEvent.description}`);
    } else {
      state.eventLog.unshift(`[${town.name}] ${newEvent.title}: ${newEvent.description}`);
    }
  }
  
  // Generate potential seasonal event
  const seasonalEvent = generateSeasonalEvent(state);
  if (seasonalEvent) {
    state.activeEvents.push(seasonalEvent);
    state.eventLog.unshift(`🎪 [Festival] ${seasonalEvent.title}: ${seasonalEvent.description}`);
  }
  
  // Regenerate market prices (now includes seasonal effects)
  generateMarketPrices(state);
  
  // Check win/loss conditions
  if (state.gold >= state.targetGold) {
    state.gameStatus = 'won';
  } else if (state.turn > state.maxTurns) {
    state.gameStatus = 'ended';
  }
  
  // Add travel log
  const town = towns.find(t => t.id === townId)!;
  state.eventLog.unshift(`Traveled to ${town.name} (Turn ${state.turn})`);
  
  // Keep event log manageable
  if (state.eventLog.length > 12) {
    state.eventLog = state.eventLog.slice(0, 12);
  }
}

export function calculateScore(state: GameState): number {
  let score = state.gold;
  
  // Bonus for finishing early
  const turnsRemaining = state.maxTurns - state.turn;
  if (state.gameStatus === 'won') {
    score += turnsRemaining * 50;
  }
  
  // Bonus for inventory value
  const inventoryValue = Object.entries(state.inventory).reduce((total, [goodId, quantity]) => {
    const good = goods.find(g => g.id === goodId)!;
    return total + (quantity * good.basePrice * 0.8); // Discounted value
  }, 0);
  
  score += Math.round(inventoryValue);
  
  return score;
}