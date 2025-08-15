import { GameEvent } from '../types/game';

export const gameEvents: GameEvent[] = [

  {
    id: 'war_outbreak',
    type: 'global',
    title: 'War Breaks Out',
    description: 'Conflicts in neighboring lands drive up demand for iron and weapons.',
    effects: { iron: 1.5, gems: 0.8 },
    duration: 3,
    weight: 15
  },
  {
    id: 'great_harvest',
    type: 'global',
    title: 'Bountiful Harvest',
    description: 'An exceptional harvest season floods markets with cheap grain.',
    effects: { grain: 0.6, salt: 1.2 },
    duration: 2,
    weight: 20
  },
  {
    id: 'trade_route_opened',
    type: 'global',
    title: 'New Trade Route',
    description: 'A new sea route brings exotic goods at lower prices.',
    effects: { silk: 0.8, spices: 0.7 },
    duration: 4,
    weight: 12
  },
  {
    id: 'plague_outbreak',
    type: 'global',
    title: 'Disease Spreads',
    description: 'A mysterious illness affects livestock, driving up food prices.',
    effects: { fish: 1.4, grain: 1.3, salt: 1.2 },
    duration: 3,
    weight: 10
  },
  {
    id: 'royal_wedding',
    type: 'global',
    title: 'Royal Wedding',
    description: 'A grand royal celebration increases demand for luxury goods.',
    effects: { silk: 1.4, gems: 1.6, spices: 1.3 },
    duration: 2,
    weight: 18
  },

  {
    id: 'festival_northport',
    type: 'local',
    title: 'Northport Sea Festival',
    description: 'Northport celebrates with a grand fishing festival.',
    effects: { fish: 1.3, salt: 1.2 },
    duration: 1,
    weight: 25
  },
  {
    id: 'mine_collapse_emberfall',
    type: 'local',
    title: 'Mine Collapse in Emberfall',
    description: 'A cave-in at the main mine disrupts iron production.',
    effects: { iron: 1.6, gems: 1.4 },
    duration: 2,
    weight: 15
  },
  {
    id: 'caravan_arrives_stonehold',
    type: 'local',
    title: 'Merchant Caravan Arrives',
    description: 'A large caravan from the east brings silk and spices to Stonehold.',
    effects: { silk: 0.7, spices: 0.6 },
    duration: 1,
    weight: 30
  },
  {
    id: 'bandit_raids_greymoor',
    type: 'local',
    title: 'Bandit Raids Near Greymoor',
    description: 'Highway bandits disrupt trade, making goods scarcer.',
    effects: { gems: 1.4, spices: 1.3, silk: 1.2 },
    duration: 2,
    weight: 20
  },
  {
    id: 'storm_damages_northport',
    type: 'local',
    title: 'Storm Hits Northport',
    description: 'A fierce storm damages fishing boats and grain stores.',
    effects: { fish: 1.5, grain: 1.3, salt: 0.9 },
    duration: 2,
    weight: 18
  }
];
