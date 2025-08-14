import { GameState, GameEvent, TransactionResult } from '../types/game';
import { towns } from '../data/towns';
import { goods } from '../data/goods';
import { gameEvents } from '../data/events';

export function initializeGameState(): GameState {
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
    marketPrices: {}
  };

  // Initialize inventor
  goods.forEach(good => {
    state.inventory[good.id] = 0;
  });

  // Generate initial market prices
  generateMarketPrices(state);
  
  return state;
}

export function generateMarketPrices(state: GameState): void {
  state.marketPrices = {};
  
  towns.forEach(town => {
    state.marketPrices[town.id] = {};
    
    goods.forEach(good => {
      let basePrice = good.basePrice;
      let townModifier = town.priceModifiers[good.id] || 1.0;
      
      // Apply active event effects
      let eventModifier = 1.0;
      state.activeEvents.forEach(event => {
        if (event.effects[good.id]) {
          if (event.type === 'global') {
            eventModifier *= event.effects[good.id];
          } else if (event.type === 'local' && town.id === state.currentTownId) {
            eventModifier *= event.effects[good.id];
          }
        }
      });
      
      // Add some random variation (±15%)
      let randomModifier = 0.85 + Math.random() * 0.3;
      
      let finalPrice = Math.round(basePrice * townModifier * eventModifier * randomModifier);
      
      // Buy price is slightly higher than sell price for the player
      let buyPrice = Math.round(finalPrice * 1.1);
      let sellPrice = Math.round(finalPrice * 0.9);
      
      // Available quantity (random between 10-50)
      let available = Math.floor(Math.random() * 40) + 10;
      
      state.marketPrices[town.id][good.id] = {
        buy: buyPrice,
        sell: sellPrice,
        available: available
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
  
  // Process active events (reduce duration)
  state.activeEvents = state.activeEvents
    .map(event => ({ ...event, duration: event.duration - 1 }))
    .filter(event => event.duration > 0);
  
  // Generate new event
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
  
  // Regenerate market prices
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
  if (state.eventLog.length > 10) {
    state.eventLog = state.eventLog.slice(0, 10);
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