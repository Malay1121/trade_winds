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
  type: 'global' | 'local' | 'seasonal';
  title: string;
  description: string;
  effects: { [goodId: string]: number };
  duration: number;
  weight: number;
}

export interface Season {
  id: string;
  name: string;
  description: string;
  goodsAvailability: { [goodId: string]: number };
  priceModifiers: { [goodId: string]: number };
  festivalChance: number;
  duration: number;
}

export interface TradeRecord {
  id: string;
  timestamp: Date;
  type: 'buy' | 'sell';
  goodId: string;
  goodName: string;
  quantity: number;
  pricePerUnit: number;
  totalValue: number;
  townId: string;
  townName: string;
  turn: number;
  season: string;
}

export interface PriceAlert {
  id: string;
  goodId: string;
  goodName: string;
  targetPrice: number;
  alertType: 'above' | 'below';
  isActive: boolean;
  createdTurn: number;
}

export interface NewsItem {
  id: string;
  type: 'event' | 'price_change' | 'opportunity' | 'weather';
  title: string;
  content: string;
  impact: string;
  severity: 'low' | 'medium' | 'high';
  turn: number;
  expiresAt: number;
  townId?: string;
  goodIds?: string[];
}

export interface TradeOpportunity {
  id: string;
  type: 'price_gap' | 'shortage' | 'surplus' | 'seasonal';
  title: string;
  description: string;
  sourceTownId: string;
  targetTownId: string;
  goodId: string;
  goodName: string;
  sourceTownName: string;
  targetTownName: string;
  sourcePrice: number;
  targetPrice: number;
  potentialProfit: number;
  profitMargin: number;
  urgency: 'low' | 'medium' | 'high';
  validUntil: number;
}

export interface MarketAlerts {
  priceAlerts: PriceAlert[];
  news: NewsItem[];
  opportunities: TradeOpportunity[];
  lastCheckedTurn: number;
}

export interface TownReputation {
  townId: string;
  points: number;
  status: 'blacklisted' | 'poor' | 'neutral' | 'good' | 'excellent' | 'vip';
  priceModifier: number;
  exclusiveGoodsAccess: string[];
}

export interface ReputationEvent {
  id: string;
  townId: string;
  action: string;
  pointsChanged: number;
  timestamp: number;
  description: string;
}

export interface ReputationSystem {
  globalReputation: number;
  townReputations: { [townId: string]: TownReputation };
  reputationEvents: ReputationEvent[];
}

export interface RouteAnalysis {
  fromTown: string;
  toTown: string;
  goodId: string;
  goodName: string;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  profit: number;
  profitMargin: number;
  turn: number;
  season: string;
}

export interface TradingStats {
  totalTrades: number;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  bestTrade: RouteAnalysis | null;
  worstTrade: RouteAnalysis | null;
  favoriteGood: string | null;
  mostProfitableRoute: { from: string; to: string; profit: number } | null;
  averageProfitPerTrade: number;
  successfulTrades: number;
  lossfulTrades: number;
  tradesByGood: { [goodId: string]: { trades: number; profit: number; volume: number } };
  tradesByTown: { [townId: string]: { trades: number; profit: number; volume: number } };
  tradesBySeason: { [season: string]: { trades: number; profit: number; volume: number } };
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
  currentSeason: string;
  seasonTurn: number;
  tradingJournal: TradeRecord[];
  pendingPurchases: { [goodId: string]: { price: number; town: string; turn: number; season: string } };
  marketAlerts: MarketAlerts;
  reputation: ReputationSystem;
}

export interface TransactionResult {
  success: boolean;
  message: string;
  goldChange?: number;
  cargoChange?: number;
}