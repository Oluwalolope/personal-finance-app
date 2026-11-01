import { Expense, Income } from './types';

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

let masked = false;
export const setMasked = (v: boolean) => { masked = v; };
export const fmt = (n: number): string =>
  masked ? '₦ ••••' : (n < 0 ? '-' : '') + '₦' + Math.round(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
export const fmtShort = (n: number): string =>
  masked ? '••' : n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1000 ? Math.round(n / 100) / 10 + 'k' : String(Math.round(n));
export const monthKeyTitle = (k: string): string => `${MONTHS[Number(k.slice(5, 7)) - 1]} ${k.slice(0, 4)}`;
export const fmtInput = (s: string): string => {
  const [i, d] = s.split('.');
  const ii = (i || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return d !== undefined ? `${ii}.${d}` : ii;
};
const p = (n: number) => String(n).padStart(2, '0');
export const dayKey = (d = new Date()): string => `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
export const monthKey = (d = new Date()): string => dayKey(d).slice(0, 7);
export const daysInMonth = (d: Date): number => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
export const daysLeft = (d = new Date()): number => daysInMonth(d) - d.getDate() + 1;
export const monthTitle = (d: Date): string => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
export const dayLabel = (k: string): string => {
  const [y, m, d] = k.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DAYS[dt.getDay()]}, ${d} ${MONTHS[m - 1].slice(0, 3)}`;
};
export const timeLabel = (ts?: number): string => {
  if (!ts) return '';
  const d = new Date(ts);
  const h = d.getHours();
  return `${h % 12 || 12}:${p(d.getMinutes())} ${h >= 12 ? 'PM' : 'AM'}`;
};
export const groupLabel = (k: string): string => {
  if (k === dayKey()) return 'Today';
  const [y, m, d] = k.split('-').map(Number);
  const t = new Date();
  const diff = Math.round((new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime() - new Date(y, m - 1, d).getTime()) / 86400000);
  if (diff === 1) return 'Yesterday';
  if (diff > 1 && diff < 7) return WEEKDAYS[new Date(y, m - 1, d).getDay()];
  return `${p(d)}-${p(m)}-${y}`;
};
export const sum = (a: { amount: number }[]): number => a.reduce((s, x) => s + x.amount, 0);
const q = (s: string | undefined) => `"${String(s ?? '').replace(/"/g, '""')}"`;

export const toCsv = (income: Income[], expenses: Expense[], catLabel: (k: string) => string): string =>
  ['Date,Type,Category,Note,Amount']
    .concat(
      income.map((i) => [i.date, 'Income', q(i.source), q(i.note), i.amount].join(',')),
      expenses.map((e) => [e.date, 'Expense', q(catLabel(e.cat)), q(e.note), -e.amount].join(','))
    )
    .join('\n');
