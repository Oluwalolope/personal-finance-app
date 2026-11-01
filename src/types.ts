export type Category = { id: string; name: string; budget: number };
export type Income = { id: string; date: string; amount: number; source: string; note: string; ts?: number };
export type Expense = { id: string; date: string; amount: number; cat: string; note: string; ts?: number };
export type Data = { income: Income[]; expenses: Expense[]; moved: Record<string, number>; cats: Category[] };
export type SplitConfig = { key: string; label: string; pct: number; dest: string };
export type CatView = Category & {
  index: number; hasBudget: boolean; spent: number; left: number; today: number;
  limit: number; todayLeft: number; perDay: number;
};
export type SplitView = SplitConfig & { amount: number; sent: number; remaining: number; done: boolean };
export type Row = {
  id: string; date: string; amount: number; note: string;
  type: 'income' | 'expenses'; title: string; ts?: number;
};
