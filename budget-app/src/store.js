// Budget constants for 이현 + 혜원
export const BUDGET = {
  income: {
    ihyeon: 3388000,
    hyewon: 217139,
    total: 3605139,
  },
  fixed: {
    ihyeon: 1556250,
    hyewon: 538559,
  },
  savings: 500000,
  investment: 300000,
  allowance: { ihyeon: 200000, hyewon: 200000 },
  reserve: 100000,
  variable: 210330,
};

export const CATEGORIES = [
  { id: '식비', label: '🍚 식비', color: '#C0622A' },
  { id: '카페', label: '☕ 카페', color: '#E8A060' },
  { id: '쇼핑', label: '🛍️ 쇼핑', color: '#8B6FBE' },
  { id: '교통', label: '🚗 교통', color: '#3A6FA8' },
  { id: '의료', label: '💊 의료', color: '#D94040' },
  { id: '여가', label: '🎮 여가', color: '#5F8A6E' },
  { id: '경조사', label: '🎁 경조사', color: '#C8960A' },
  { id: '기타', label: '📦 기타', color: '#9A9A9A' },
];

export const CAT_BUDGET = {
  '식비': 80000,
  '카페': 30000,
  '쇼핑': 40000,
  '교통': 20000,
  '의료': 15000,
  '여가': 15000,
  '경조사': 0,
  '기타': 10330,
};

// Sample initial expenses for current month (2026-05)
const SAMPLE_EXPENSES = [
  { id: '1', date: '2026-05-27', amount: 12000, category: '식비', merchant: '김밥천국', person: '이현', memo: '' },
  { id: '2', date: '2026-05-26', amount: 5900, category: '카페', merchant: '스타벅스', person: '혜원', memo: '아메리카노' },
  { id: '3', date: '2026-05-25', amount: 32400, category: '쇼핑', merchant: '쿠팡', person: '이현', memo: '주방용품' },
  { id: '4', date: '2026-05-24', amount: 4200, category: '카페', merchant: 'GS25', person: '혜원', memo: '' },
  { id: '5', date: '2026-05-22', amount: 18000, category: '식비', merchant: '이마트', person: '혜원', memo: '장보기' },
  { id: '6', date: '2026-05-20', amount: 8500, category: '교통', merchant: '주유소', person: '이현', memo: '' },
  { id: '7', date: '2026-05-18', amount: 9000, category: '여가', merchant: '넷플릭스', person: '이현', memo: '구독' },
];

export const GOAL_JARS = [
  { id: 'travel', label: '✈️ 여행', target: 2000000, current: 650000 },
  { id: 'appliance', label: '🏠 가전', target: 1500000, current: 300000 },
  { id: 'wedding', label: '💍 결혼', target: 5000000, current: 1200000 },
];

// LocalStorage helpers
const STORAGE_KEY = 'woori-gaebu-v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function getInitialState() {
  const saved = loadState();
  if (saved) return saved;
  return {
    expenses: SAMPLE_EXPENSES,
    savingsLog: [
      { month: '2026-03', hit: true },
      { month: '2026-04', hit: true },
      { month: '2026-05', hit: false },
    ],
    streak: 2,
    coupleMessages: [],
    jars: GOAL_JARS,
  };
}

export function persistState(state) {
  saveState(state);
}

// Derived helpers
export function getMonthExpenses(expenses, month) {
  return expenses.filter(e => e.date.startsWith(month));
}

export function getCategoryTotals(expenses) {
  const totals = {};
  CATEGORIES.forEach(c => { totals[c.id] = 0; });
  expenses.forEach(e => { totals[e.category] = (totals[e.category] || 0) + e.amount; });
  return totals;
}

export function getTotalSpent(expenses) {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function getCatColor(catId) {
  return CATEGORIES.find(c => c.id === catId)?.color || '#9A9A9A';
}

export function getCatLabel(catId) {
  return CATEGORIES.find(c => c.id === catId)?.label || catId;
}

export function formatKRW(n) {
  return n.toLocaleString('ko-KR') + '원';
}

export function getBarColor(pct) {
  if (pct >= 1) return '#D94040';
  if (pct >= 0.8) return '#E8A060';
  return '#5F8A6E';
}

export function getEggState(streak) {
  if (streak >= 6) return { emoji: '🐉', label: '전설의 용!', color: '#C8960A' };
  if (streak >= 4) return { emoji: '🐓', label: '닭이 됐어요!', color: '#5F8A6E' };
  if (streak >= 2) return { emoji: '🐣', label: '부화 중!', color: '#E8A060' };
  if (streak >= 1) return { emoji: '🥚', label: '알이 흔들려요!', color: '#C0622A' };
  return { emoji: '🪨', label: '아직 돌이에요', color: '#9A9A9A' };
}
