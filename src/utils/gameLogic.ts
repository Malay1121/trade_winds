import { GameState, GameEvent, TransactionResult, TradeRecord, RouteAnalysis, TradingStats, PriceAlert, NewsItem, TradeOpportunity, MarketAlerts } from '../types/game';
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
  const savedGame = loadGameState();
  if (savedGame) {
    generateMarketPrices(savedGame);
    return savedGame;
  }

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
    pendingPurchases: {},
    marketAlerts: {
      priceAlerts: [],
      news: [],
      opportunities: [],
      lastCheckedTurn: 1
    }
  };

  goods.forEach(good => {
    state.inventory[good.id] = 0;
  });

  const currentSeasonData = seasons.find(s => s.id === state.currentSeason)!;
  state.eventLog.unshift(`🌱 ${currentSeasonData.name} has arrived! ${currentSeasonData.description}`);

  generateMarketPrices(state);
  
  return state;
}

export function generateMarketPrices(state: GameState): void {
  state.marketPrices = {};
  
  const currentSeasonData = seasons.find(s => s.id === state.currentSeason)!;
  
  towns.forEach(town => {
    state.marketPrices[town.id] = {};
    
    goods.forEach(good => {
      let basePrice = good.basePrice;
      let townModifier = town.priceModifiers[good.id] || 1.0;
      
      let seasonalPriceModifier = currentSeasonData.priceModifiers[good.id] || 1.0;
      let seasonalAvailabilityModifier = currentSeasonData.goodsAvailability[good.id] || 1.0;
      
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
      
      let randomModifier = 0.85 + Math.random() * 0.3;
      
      let finalPrice = Math.round(basePrice * townModifier * seasonalPriceModifier * eventModifier * randomModifier);
      
      let buyPrice = Math.round(finalPrice * 1.1);
      let sellPrice = Math.round(finalPrice * 0.9);
      
      let baseAvailable = Math.floor(Math.random() * 40) + 10;
      let available = Math.round(baseAvailable * seasonalAvailabilityModifier);
      
      state.marketPrices[town.id][good.id] = {
        buy: buyPrice,
        sell: sellPrice,
        available: Math.max(1, available)
      };
    });
  });
}

export function generateRandomEvent(): GameEvent | null {
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
  

  if (Math.random() < currentSeasonData.festivalChance) {
    const seasonalEvents = seasonalFestivals.filter(event => event.season === state.currentSeason);
    if (seasonalEvents.length > 0) {
      const randomEvent = seasonalEvents[Math.floor(Math.random() * seasonalEvents.length)];

      const { season, ...gameEvent } = randomEvent;
      return gameEvent as GameEvent;
    }
  }
  
  return null;
}

export function updateSeasons(state: GameState): void {
  state.seasonTurn++;
  
  const currentSeasonData = seasons.find(s => s.id === state.currentSeason)!;
  

  if (state.seasonTurn > currentSeasonData.duration) {
    const currentIndex = seasons.findIndex(s => s.id === state.currentSeason);
    const nextIndex = (currentIndex + 1) % seasons.length;
    const nextSeason = seasons[nextIndex];
    
    state.currentSeason = nextSeason.id;
    state.seasonTurn = 1;
    

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


  if (type === 'buy') {
    if (!state.pendingPurchases[goodId]) {
      state.pendingPurchases[goodId] = {
        price: pricePerUnit,
        town: state.currentTownId,
        turn: state.turn,
        season: state.currentSeason
      };
    } else {

      const existingValue = state.pendingPurchases[goodId].price * (state.inventory[goodId] - quantity);
      const newValue = pricePerUnit * quantity;
      const totalQuantity = state.inventory[goodId];
      state.pendingPurchases[goodId].price = (existingValue + newValue) / totalQuantity;
    }
  }


  if (state.tradingJournal.length > 100) {
    state.tradingJournal = state.tradingJournal.slice(-100);
  }
}

export function calculateRouteAnalysis(state: GameState): RouteAnalysis[] {
  const routes: RouteAnalysis[] = [];
  const sellTrades = state.tradingJournal.filter(t => t.type === 'sell');

  sellTrades.forEach(sellTrade => {

    const buyTrades = state.tradingJournal.filter(t => 
      t.type === 'buy' && 
      t.goodId === sellTrade.goodId && 
      t.timestamp < sellTrade.timestamp
    );

    if (buyTrades.length > 0) {

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


  const tradesByGood: { [goodId: string]: { trades: number; profit: number; volume: number } } = {};
  routes.forEach(route => {
    if (!tradesByGood[route.goodId]) {
      tradesByGood[route.goodId] = { trades: 0, profit: 0, volume: 0 };
    }
    tradesByGood[route.goodId].trades++;
    tradesByGood[route.goodId].profit += route.profit;
    tradesByGood[route.goodId].volume += route.quantity;
  });


  const tradesByTown: { [townId: string]: { trades: number; profit: number; volume: number } } = {};
  state.tradingJournal.forEach(trade => {
    if (!tradesByTown[trade.townId]) {
      tradesByTown[trade.townId] = { trades: 0, profit: 0, volume: 0 };
    }
    tradesByTown[trade.townId].trades++;
    tradesByTown[trade.townId].volume += trade.quantity;
  });


  routes.forEach(route => {
    if (tradesByTown[route.fromTown]) {
      tradesByTown[route.fromTown].profit += route.profit;
    }
  });


  const tradesBySeason: { [season: string]: { trades: number; profit: number; volume: number } } = {};
  routes.forEach(route => {
    if (!tradesBySeason[route.season]) {
      tradesBySeason[route.season] = { trades: 0, profit: 0, volume: 0 };
    }
    tradesBySeason[route.season].trades++;
    tradesBySeason[route.season].profit += route.profit;
    tradesBySeason[route.season].volume += route.quantity;
  });


  let favoriteGood = null;
  let maxVolume = 0;
  Object.entries(tradesByGood).forEach(([goodId, stats]) => {
    if (stats.volume > maxVolume) {
      maxVolume = stats.volume;
      favoriteGood = goods.find(g => g.id === goodId)?.name || goodId;
    }
  });


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
  

  state.gold -= totalCost;
  state.inventory[goodId] = (state.inventory[goodId] || 0) + quantity;
  state.currentCargo += cargoNeeded;
  state.marketPrices[town.id][goodId].available -= quantity;
  

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
  

  state.gold += totalEarnings;
  state.inventory[goodId] -= quantity;
  state.currentCargo -= quantity;
  

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
  

  updateSeasons(state);
  

  state.activeEvents = state.activeEvents
    .map(event => ({ ...event, duration: event.duration - 1 }))
    .filter(event => event.duration > 0);
  

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
  

  const seasonalEvent = generateSeasonalEvent(state);
  if (seasonalEvent) {
    state.activeEvents.push(seasonalEvent);
    state.eventLog.unshift(`🎪 [Festival] ${seasonalEvent.title}: ${seasonalEvent.description}`);
  }
  

  generateMarketPrices(state);
  

  updateMarketAlerts(state);
  

  if (state.gold >= state.targetGold) {
    state.gameStatus = 'won';
  } else if (state.turn > state.maxTurns) {
    state.gameStatus = 'ended';
  }
  

  const town = towns.find(t => t.id === townId)!;
  state.eventLog.unshift(`Traveled to ${town.name} (Turn ${state.turn})`);
  

  if (state.eventLog.length > 12) {
    state.eventLog = state.eventLog.slice(0, 12);
  }
}

export function calculateScore(state: GameState): number {
  let score = state.gold;
  

  const turnsRemaining = state.maxTurns - state.turn;
  if (state.gameStatus === 'won') {
    score += turnsRemaining * 50;
  }
  

  const inventoryValue = Object.entries(state.inventory).reduce((total, [goodId, quantity]) => {
    const good = goods.find(g => g.id === goodId)!;
    return total + (quantity * good.basePrice * 0.8);
  }, 0);
  
  score += Math.round(inventoryValue);
  
  return score;
}


export function createPriceAlert(state: GameState, goodId: string, targetPrice: number, alertType: 'above' | 'below'): void {
  const good = goods.find(g => g.id === goodId);
  if (!good) return;

  const alert: PriceAlert = {
    id: `alert_${Date.now()}_${goodId}`,
    goodId,
    goodName: good.name,
    targetPrice,
    alertType,
    isActive: true,
    createdTurn: state.turn
  };

  state.marketAlerts.priceAlerts.push(alert);
}

export function removePriceAlert(state: GameState, alertId: string): void {
  state.marketAlerts.priceAlerts = state.marketAlerts.priceAlerts.filter(alert => alert.id !== alertId);
}

export function checkPriceAlerts(state: GameState): PriceAlert[] {
  const triggeredAlerts: PriceAlert[] = [];
  
  state.marketAlerts.priceAlerts.forEach(alert => {
    if (!alert.isActive) return;

    const currentPrices = state.marketPrices[state.currentTownId]?.[alert.goodId];
    if (!currentPrices) return;

    const sellPrice = currentPrices.sell;
    const buyPrice = currentPrices.buy;
    const relevantPrice = alert.alertType === 'above' ? sellPrice : buyPrice;

    const isTriggered = alert.alertType === 'above' 
      ? relevantPrice >= alert.targetPrice
      : relevantPrice <= alert.targetPrice;

    if (isTriggered) {
      triggeredAlerts.push(alert);
      alert.isActive = false;
      

      const action = alert.alertType === 'above' ? 'can be sold for' : 'can be bought for';
      state.eventLog.unshift(
        `💰 Price Alert: ${alert.goodName} ${action} ${relevantPrice} gold (target: ${alert.targetPrice})`
      );
    }
  });

  return triggeredAlerts;
}

export function generateTradeOpportunities(state: GameState): TradeOpportunity[] {
  const opportunities: TradeOpportunity[] = [];
  const currentTown = towns.find(t => t.id === state.currentTownId)!;
  const otherTowns = towns.filter(t => t.id !== state.currentTownId);

  goods.forEach(good => {
    const currentTownPrices = state.marketPrices[state.currentTownId]?.[good.id];
    if (!currentTownPrices) return;

    otherTowns.forEach(otherTown => {
      const otherTownPrices = state.marketPrices[otherTown.id]?.[good.id];
      if (!otherTownPrices) return;

      const buyPrice = currentTownPrices.buy;
      const sellPrice = otherTownPrices.sell;
      const profit = sellPrice - buyPrice;
      const margin = profit / buyPrice;


      if (profit > 10 && margin > 0.15) {
        const urgency = margin > 0.5 ? 'high' : margin > 0.3 ? 'medium' : 'low';
        
        const opportunity: TradeOpportunity = {
          id: `opp_${state.turn}_${good.id}_${currentTown.id}_${otherTown.id}`,
          type: margin > 0.4 ? 'shortage' : 'price_gap',
          title: `${good.name}: ${currentTown.name} → ${otherTown.name}`,
          description: `Buy for ${buyPrice}g, sell for ${sellPrice}g`,
          sourceTownId: state.currentTownId,
          targetTownId: otherTown.id,
          goodId: good.id,
          goodName: good.name,
          sourceTownName: currentTown.name,
          targetTownName: otherTown.name,
          sourcePrice: buyPrice,
          targetPrice: sellPrice,
          potentialProfit: profit,
          profitMargin: margin,
          urgency,
          validUntil: state.turn + 3
        };

        opportunities.push(opportunity);
      }
    });
  });


  return opportunities.sort((a, b) => b.profitMargin - a.profitMargin).slice(0, 5);
}

export function generateNewsItems(state: GameState): NewsItem[] {
  const news: NewsItem[] = [];
  const currentTown = towns.find(t => t.id === state.currentTownId)!;
  const currentSeason = seasons.find(s => s.id === state.currentSeason)!;


  if (Math.random() < 0.3) {
    const weatherEvents = [
      { title: "Favorable Winds", content: "Trade ships are arriving ahead of schedule", impact: "Increased goods availability", severity: 'low' as const },
      { title: "Storm Warning", content: "Severe weather may disrupt trade routes", impact: "Potential supply shortages", severity: 'medium' as const },
      { title: "Drought Conditions", content: "Agricultural goods may become scarce", impact: "Food prices rising", severity: 'high' as const }
    ];
    
    const weatherEvent = weatherEvents[Math.floor(Math.random() * weatherEvents.length)];
    news.push({
      id: `news_weather_${state.turn}`,
      type: 'weather',
      title: weatherEvent.title,
      content: weatherEvent.content,
      impact: weatherEvent.impact,
      severity: weatherEvent.severity,
      turn: state.turn,
      expiresAt: state.turn + 2,
      townId: currentTown.id
    });
  }


  state.activeEvents.forEach(event => {
    news.push({
      id: `news_event_${event.id}_${state.turn}`,
      type: 'event',
      title: event.title,
      content: event.description,
      impact: "Market prices affected",
      severity: 'medium',
      turn: state.turn,
      expiresAt: state.turn + event.duration,
      goodIds: Object.keys(event.effects)
    });
  });


  if (Math.random() < 0.4) {
    const volatileGoods = goods.filter(good => {
      const prices = state.marketPrices[state.currentTownId]?.[good.id];
      return prices && (prices.buy > good.basePrice * 1.2 || prices.buy < good.basePrice * 0.8);
    });

    if (volatileGoods.length > 0) {
      const good = volatileGoods[Math.floor(Math.random() * volatileGoods.length)];
      const prices = state.marketPrices[state.currentTownId][good.id];
      const isHigh = prices.buy > good.basePrice * 1.1;

      news.push({
        id: `news_price_${good.id}_${state.turn}`,
        type: 'price_change',
        title: `${good.name} Prices ${isHigh ? 'Soar' : 'Plummet'}`,
        content: `${good.name} is trading at ${isHigh ? 'premium' : 'discount'} rates in ${currentTown.name}`,
        impact: isHigh ? "Great selling opportunity" : "Excellent buying opportunity",
        severity: isHigh ? 'medium' : 'low',
        turn: state.turn,
        expiresAt: state.turn + 2,
        townId: currentTown.id,
        goodIds: [good.id]
      });
    }
  }

  return news;
}

export function updateMarketAlerts(state: GameState): void {
  if (state.marketAlerts.lastCheckedTurn >= state.turn) return;


  checkPriceAlerts(state);


  const opportunities = generateTradeOpportunities(state);
  state.marketAlerts.opportunities = opportunities;


  const news = generateNewsItems(state);
  

  state.marketAlerts.news = [
    ...news,
    ...state.marketAlerts.news.filter(item => item.expiresAt > state.turn)
  ].slice(0, 10);

  state.marketAlerts.lastCheckedTurn = state.turn;
}

export function getActiveAlerts(state: GameState): { alerts: PriceAlert[]; opportunities: TradeOpportunity[]; news: NewsItem[] } {
  return {
    alerts: state.marketAlerts.priceAlerts.filter(alert => alert.isActive),
    opportunities: state.marketAlerts.opportunities.filter(opp => opp.validUntil > state.turn),
    news: state.marketAlerts.news.filter(item => item.expiresAt > state.turn)
  };
}
