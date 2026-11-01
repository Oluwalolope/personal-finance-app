import { Category, SplitConfig } from './types';

export const NAME = 'Oluwalolope';
export const MAIN_ACCOUNT = 'OPay';
export const INCOME_SOURCES = ['Allowance', 'Salary', 'Gift'];
export const SPLITS: SplitConfig[] = [
  { key: 'family', label: 'Family & friends', pct: 5, dest: 'Sterling' },
  { key: 'invest', label: 'Investments', pct: 15, dest: 'Bamboo / ARM / FBS' },
  { key: 'savings', label: 'Savings', pct: 20, dest: 'PiggyVest' },
];
export const LIVING_PCT = 60; // stays in OPay

// Starting sections with no budget. Add, edit or delete them in the Budget tab.
export const DEFAULT_CATS: Category[] = [
  { id: 'food', name: 'Food', budget: 0 },
  { id: 'groceries', name: 'Groceries', budget: 0 },
  { id: 'transport', name: 'Transport', budget: 0 },
  { id: 'bills', name: 'Utilities & bills', budget: 0 },
  { id: 'airtime', name: 'Airtime & data', budget: 0 },
  { id: 'health', name: 'Health', budget: 0 },
];
