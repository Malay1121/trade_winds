export interface Town {
  id: string;
  name: string;
  description: string;
  specialties: string[];
  priceModifiers: { [key: string]: number };
}

export interface Good {
  id: string;
  name: string;
  basePrice: number;
  category: string;
  description: string;
}

export interface GameEvent {
  id: string;
  type: 'global' | 'local';
  title: string;
  description: string;
  effects: { [goodId: string]: number };
  duration: number;
  weight: number;
}

export interface GameState {
  currentTownId: string;
  gold: number;
  inventory: { [goodId: string]: number };
  turn: number;
  maxTurns: number;
  cargoLimit: number;
  currentCargo: number;
  targetGold: number;
  gameStatus: 'playing' | 'won' | 'lost' | 'ended';
  activeEvents: GameEvent[];
  eventLog: string[];
  marketPrices: { [townId: string]: { [goodId: string]: { buy: number; sell: number; available: number } } };
}

export interface TransactionResult {
  success: boolean;
  message: string;
  goldChange?: number;
  cargoChange?: number;
}