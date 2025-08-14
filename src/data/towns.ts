import { Town } from '../types/game';

export const towns: Town[] = [
  {
    id: 'northport',
    name: 'Northport',
    description: 'A bustling coastal city known for its fishing industry and grain imports.',
    specialties: ['grain', 'fish', 'salt'],
    priceModifiers: {
      grain: 0.8,
      fish: 0.7,
      salt: 0.9,
      silk: 1.2,
      spices: 1.1,
      iron: 1.0,
      gems: 1.3
    }
  },
  {
    id: 'emberfall',
    name: 'Emberfall',
    description: 'A mountain town famous for its forges and precious metal mining.',
    specialties: ['iron', 'gems', 'tools'],
    priceModifiers: {
      grain: 1.1,
      fish: 1.2,
      salt: 1.0,
      silk: 1.1,
      spices: 0.9,
      iron: 0.7,
      gems: 0.8
    }
  },
  {
    id: 'stonehold',
    name: 'Stonehold',
    description: 'An ancient fortress city that serves as a major trading hub.',
    specialties: ['silk', 'spices', 'luxuries'],
    priceModifiers: {
      grain: 1.0,
      fish: 1.0,
      salt: 1.0,
      silk: 0.8,
      spices: 0.7,
      iron: 1.1,
      gems: 1.0
    }
  },
  {
    id: 'greymoor',
    name: 'Greymoor',
    description: 'A mysterious border town known for its exotic goods and rare finds.',
    specialties: ['spices', 'gems', 'rarities'],
    priceModifiers: {
      grain: 1.2,
      fish: 1.1,
      salt: 1.1,
      silk: 1.0,
      spices: 0.8,
      iron: 1.2,
      gems: 0.9
    }
  }
];