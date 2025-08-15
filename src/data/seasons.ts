import { Season } from '../types/game';

export const seasons: Season[] = [
  {
    id: 'spring',
    name: 'Spring',
    description: 'Renewal and growth season. Fresh fish abundant, early crops available.',
    goodsAvailability: {
      fish: 1.3,
      grain: 0.8,
      salt: 1.1,
      silk: 1.0,
      spices: 1.0,
      iron: 1.0,
      gems: 1.0
    },
    priceModifiers: {
      fish: 0.8,
      grain: 1.2,
      salt: 0.9,
      silk: 1.0,
      spices: 1.0,
      iron: 1.0,
      gems: 1.0
    },
    festivalChance: 0.3,
    duration: 5
  },
  {
    id: 'summer',
    name: 'Summer',
    description: 'Peak trading season. Luxury goods in high demand for festivals.',
    goodsAvailability: {
      fish: 1.2,
      grain: 0.7,
      salt: 1.2,
      silk: 1.1,
      spices: 1.1,
      iron: 1.1,
      gems: 1.2
    },
    priceModifiers: {
      fish: 0.9,
      grain: 1.3,
      salt: 1.0,
      silk: 1.2,
      spices: 1.3,
      iron: 0.9,
      gems: 1.4
    },
    festivalChance: 0.5,
    duration: 5
  },
  {
    id: 'autumn',
    name: 'Autumn',
    description: 'Harvest season. Grain abundant, preservation goods in demand.',
    goodsAvailability: {
      fish: 1.0,
      grain: 1.5,
      salt: 1.3,
      silk: 1.0,
      spices: 1.0,
      iron: 1.0,
      gems: 0.9
    },
    priceModifiers: {
      fish: 1.0,
      grain: 0.6,
      salt: 1.1,
      silk: 0.9,
      spices: 0.9,
      iron: 1.0,
      gems: 0.9
    },
    festivalChance: 0.4,
    duration: 5
  },
  {
    id: 'winter',
    name: 'Winter',
    description: 'Harsh season. Preserved goods essential, luxury trade slows.',
    goodsAvailability: {
      fish: 0.7,
      grain: 1.2,
      salt: 1.0,
      silk: 0.8,
      spices: 0.7,
      iron: 0.8,
      gems: 0.7
    },
    priceModifiers: {
      fish: 1.3,
      grain: 1.0,
      salt: 1.2,
      silk: 1.1,
      spices: 1.4,
      iron: 1.1,
      gems: 1.1
    },
    festivalChance: 0.2,
    duration: 5
  }
];

export const seasonalFestivals = [

  {
    id: 'spring_renewal',
    type: 'seasonal' as const,
    title: 'Festival of Renewal',
    description: 'Spring celebrations increase demand for fresh goods and decorations.',
    effects: { fish: 1.3, silk: 1.2, gems: 1.1 } as { [key: string]: number },
    duration: 2,
    weight: 100,
    season: 'spring'
  },

  {
    id: 'midsummer_fair',
    type: 'seasonal' as const,
    title: 'Midsummer Grand Fair',
    description: 'The biggest trade fair of the year boosts luxury good prices.',
    effects: { silk: 1.5, spices: 1.6, gems: 1.8 } as { [key: string]: number },
    duration: 1,
    weight: 100,
    season: 'summer'
  },
  {
    id: 'wedding_season',
    type: 'seasonal' as const,
    title: 'Royal Wedding Season',
    description: 'Multiple noble weddings create massive demand for luxury items.',
    effects: { silk: 1.4, gems: 2.0, spices: 1.3 } as { [key: string]: number },
    duration: 3,
    weight: 100,
    season: 'summer'
  },

  {
    id: 'harvest_celebration',
    type: 'seasonal' as const,
    title: 'Great Harvest Festival',
    description: 'Communities celebrate the harvest with feasts and preservation.',
    effects: { grain: 0.5, salt: 1.4, fish: 1.2 } as { [key: string]: number },
    duration: 2,
    weight: 100,
    season: 'autumn'
  },

  {
    id: 'winter_solstice',
    type: 'seasonal' as const,
    title: 'Winter Solstice Markets',
    description: 'Special winter markets trade in warming spices and preserved foods.',
    effects: { spices: 1.5, salt: 1.3, grain: 1.1 } as { [key: string]: number },
    duration: 2,
    weight: 100,
    season: 'winter'
  }
];
