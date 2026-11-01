import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CATS, SPLITS, LIVING_PCT } from './config';
import { dayKey, monthKey, daysLeft, daysInMonth, sum, setMasked } from './utils';
import { CatView, Category, Data, Expense, Income, Row, SplitView } from './types';

const KEY = 'data';
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const byNewest = (a: Row, b: Row) => (a.date !== b.date ? (a.date < b.date ? 1 : -1) : (b.ts ?? 0) - (a.ts ?? 0));

function useBudgetState() {
  const [data, setData] = useState<Data>({ income: [], expenses: [], moved: {}, cats: DEFAULT_CATS });
  const [ready, setReady] = useState(false);
  const [hide, setHide] = useState(false);
  const now = new Date();
  const [view, setView] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selected, setSelected] = useState(dayKey(now));

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(KEY), AsyncStorage.getItem('hide')]).then(([s, h]) => {
      if (h === '1') { setMasked(true); setHide(true); }
      if (s) {
        const p = JSON.parse(s) as { income?: Income[]; expenses?: Expense[]; moved?: Record<string, unknown>; cats?: Category[] };
        const moved: Record<string, number> = {};
        Object.entries(p.moved ?? {}).forEach(([k, v]) => { moved[k] = typeof v === 'number' ? v : 0; });
        setData({ income: p.income ?? [], expenses: p.expenses ?? [], moved, cats: p.cats ?? DEFAULT_CATS });
      }
      setReady(true);
    });
  }, []);
  const save = (d: Data) => {
    setData(d);
    AsyncStorage.setItem(KEY, JSON.stringify(d));
  };

  const label = (k: string) => data.cats.find((c) => c.id === k)?.name ?? 'Uncategorised';
  const tk = dayKey(now);
  const mk = monthKey(view);
  const isCurrent = mk === monthKey(now);
  const dl = isCurrent ? daysLeft(now) : 1;
  const income = data.income.filter((i) => i.date.startsWith(mk));
  const expenses = data.expenses.filter((e) => e.date.startsWith(mk));
  const total = sum(income);
  const living = (total * LIVING_PCT) / 100;
  const dim = daysInMonth(view);
  // Money left over from every earlier month rolls into this one.
  const start = mk + '-01';
  const carry =
    (LIVING_PCT / 100) * sum(data.income.filter((i) => i.date < start)) - sum(data.expenses.filter((e) => e.date < start));
  const available = living + carry;

  const cats: CatView[] = data.cats.map((c, index) => {
    const mine = expenses.filter((e) => e.cat === c.id);
    const spent = sum(mine);
    const today = isCurrent ? sum(mine.filter((e) => e.date === tk)) : 0;
    const hasBudget = c.budget > 0;
    const limit = hasBudget ? (c.budget - (spent - today)) / dl : 0; // today's allowance
    return { ...c, index, hasBudget, spent, left: c.budget - spent, today, limit, todayLeft: hasBudget ? limit - today : 0, perDay: c.budget / dim };
  });

  const splits: SplitView[] = SPLITS.map((s) => {
    const amount = (total * s.pct) / 100;
    const sent = data.moved[mk + s.key] ?? 0;
    const remaining = Math.max(0, amount - sent);
    return { ...s, amount, sent, remaining, done: amount > 0 && remaining < 1 };
  });

  const toRows = (inc: Income[], exp: Expense[]): Row[] =>
    [
      ...inc.map((x): Row => ({ ...x, type: 'income', title: x.source })),
      ...exp.map((x): Row => ({ ...x, type: 'expenses', title: label(x.cat) })),
    ].sort(byNewest);

  const byDay: Record<string, number> = {};
  expenses.forEach((e) => { byDay[e.date] = (byDay[e.date] || 0) + e.amount; });
  const spent = sum(expenses);
  const budgeted = cats.filter((c) => c.hasBudget);

  // All-time statistics
  const allIncome = sum(data.income);
  const allSpent = sum(data.expenses);
  const monthsSeen = Array.from(new Set([...data.income, ...data.expenses].map((x) => x.date.slice(0, 7)))).sort().reverse();
  const statSplits = SPLITS.map((s) => ({
    ...s,
    due: (allIncome * s.pct) / 100,
    sent: Object.entries(data.moved).filter(([k]) => k.slice(7) === s.key).reduce((t, [, v]) => t + v, 0),
  }));
  const stats = {
    income: allIncome,
    spent: allSpent,
    splits: statSplits,
    sent: statSplits.reduce((t, s) => t + s.sent, 0),
    due: statSplits.reduce((t, s) => t + s.due, 0),
    livingLeft: (allIncome * LIVING_PCT) / 100 - allSpent,
    monthly: monthsSeen.map((m) => {
      const inc = sum(data.income.filter((i) => i.date.startsWith(m)));
      return {
        mk: m,
        income: inc,
        spent: sum(data.expenses.filter((e) => e.date.startsWith(m))),
        sent: SPLITS.reduce((t, s) => t + (data.moved[m + s.key] ?? 0), 0),
        due: (inc * (100 - LIVING_PCT)) / 100,
      };
    }),
  };

  return {
    ready, view, selected, setSelected, today: tk, isCurrent, mk, dl, total, living, cats, splits,
    income, expenses, byDay, spent, label,
    rows: toRows(income, expenses),
    allRows: toRows(data.income, data.expenses),
    assigned: sum(data.cats.map((c) => ({ amount: c.budget }))),
    carry, available, stats, hide,
    livingLeft: available - spent,
    dailyOverall: isCurrent ? Math.max(available - spent, 0) / dl : 0,
    toggleHide: () => {
      const v = !hide;
      setMasked(v);
      setHide(v);
      AsyncStorage.setItem('hide', v ? '1' : '0');
    },
    spentToday: isCurrent ? sum(expenses.filter((e) => e.date === tk)) : 0,
    hasBudgets: budgeted.length > 0,
    allowanceToday: budgeted.reduce((s, c) => s + c.limit, 0),
    budgetedToday: budgeted.reduce((s, c) => s + c.today, 0),
    todayLeftAll: budgeted.reduce((s, c) => s + c.todayLeft, 0),
    shiftMonth: (d: number) => {
      const v = new Date(view.getFullYear(), view.getMonth() + d, 1);
      setView(v);
      setSelected(monthKey(v) === monthKey(new Date()) ? dayKey(new Date()) : dayKey(v));
    },
    addIncome: (i: Pick<Income, 'amount' | 'source' | 'note'>, date = tk) =>
      save({ ...data, income: [{ id: uid(), date, ts: Date.now(), ...i }, ...data.income] }),
    addExpense: (e: Pick<Expense, 'amount' | 'cat' | 'note'>, date = tk) =>
      save({ ...data, expenses: [{ id: uid(), date, ts: Date.now(), ...e }, ...data.expenses] }),
    remove: (type: 'income' | 'expenses', id: string) =>
      save({ ...data, [type]: (data[type] as { id: string }[]).filter((x) => x.id !== id) }),
    setSent: (key: string, value: number) => save({ ...data, moved: { ...data.moved, [mk + key]: value } }),
    addCat: (name: string, budget: number) => save({ ...data, cats: [...data.cats, { id: uid(), name, budget }] }),
    updateCat: (id: string, name: string, budget: number) =>
      save({ ...data, cats: data.cats.map((c) => (c.id === id ? { ...c, name, budget } : c)) }),
    removeCat: (id: string) => save({ ...data, cats: data.cats.filter((c) => c.id !== id) }),
  };
}

type Ctx = ReturnType<typeof useBudgetState>;
const BudgetCtx = createContext<Ctx | null>(null);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const v = useBudgetState();
  return <BudgetCtx.Provider value={v}>{children}</BudgetCtx.Provider>;
}
export function useBudget(): Ctx {
  const c = useContext(BudgetCtx);
  if (!c) throw new Error('useBudget must be used inside BudgetProvider');
  return c;
}
