import { Good } from '../types/game';

export const goods: Good[] = [
  {
    id: 'grain',
    name: 'Grain',
    basePrice: 20,
    category: 'food',
    description: 'Essential foodstuff, stable demand everywhere.'
  },
  {
    id: 'fish',
    name: 'Fresh Fish',
    basePrice: 35,
    category: 'food',
    description: 'Perishable but valuable, especially inland.'
  },
  {
    id: 'salt',
    name: 'Salt',
    basePrice: 45,
    category: 'preservative',
    description: 'Precious for food preservation and trade.'
  },
  {
    id: 'silk',
    name: 'Fine Silk',
    basePrice: 80,
    category: 'luxury',
    description: 'Luxurious fabric coveted by the wealthy.'
  },
  {
    id: 'spices',
    name: 'Exotic Spices',
    basePrice: 120,
    category: 'luxury',
    description: 'Rare seasonings from distant lands.'
  },
  {
    id: 'iron',
    name: 'Iron Ingots',
    basePrice: 60,
    category: 'raw_material',
    description: 'Essential metal for tools and weapons.'
  },
  {
    id: 'gems',
    name: 'Precious Gems',
    basePrice: 200,
    category: 'luxury',
    description: 'Rare jewels of incredible value.'
  }
];