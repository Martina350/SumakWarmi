import { MENSTRUAL_PRODUCTS } from './productsSeedPart1.ts';
import { MENSTRUAL_PRODUCTS_PART2 } from './productsSeedPart2.ts';
import { BODY_AND_FOOD_PRODUCTS } from './productsSeedPart3.ts';
import { SKIN_AND_FOOD_PRODUCTS } from './productsSeedPart4.ts';
import { Product } from '../types/index.ts';

export * from './categoriesSeed.ts';
export * from './usersSeed.ts';
export * from './ordersSeed.ts';
export * from './paymentsSeed.ts';
export * from './shipmentsSeed.ts';

export const ALL_INITIAL_PRODUCTS: Product[] = [
  ...MENSTRUAL_PRODUCTS,
  ...MENSTRUAL_PRODUCTS_PART2,
  ...BODY_AND_FOOD_PRODUCTS,
  ...SKIN_AND_FOOD_PRODUCTS,
];
