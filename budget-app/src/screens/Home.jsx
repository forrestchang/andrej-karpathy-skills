import { useState, useEffect } from 'react';
import {
  BUDGET, CATEGORIES, CAT_BUDGET,
  getMonthExpenses, getCategoryTotals, getTotalSpent,
  getCatColor, getCatLabel, formatKRW, getBarColor,
} from '../store';

const CURRENT_MONTH = '2026-05';

function AnimatedNumber({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 600;
    const from = display;
    const to = value;
    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * ease));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  const isNeg = display < 0;
  return (
    <span>
      {prefix}
      <span style={{ color: isNeg ? '#D94040' : undefined }}>
        {Math.abs(display).toLocaleString('ko-KR')}
      </span>
      {suffix}
    </span>
  );
}

export default function Home({ expenses }) {
  const monthExp = getMonthExpenses(expenses, CURRENT_MONTH);
  const totals = getCategoryTotals(monthExp);
  const spent = getTotalSpent(monthExp);
  const remaining = BUDGET.variable - spent;

  const recentFive = [...monthExp].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const savingsPct = Math.min((BUDGET.savings / BUDGET.savings) * 100, 100);
  const investPct = Math.min((BUDGET.investment / BUDGET.investment) * 100, 100);

  return (
    <div className="screen" style={{ padding: '0 0 80px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1A1410 0%, #2E1E10 100%)',
        padding: '28px 20px 24px',
        color: 'white',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 12, color: '#A09080', marginBottom: 4 }}>2026년 5월 가계부</p>
            <h1 style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.2 }}>
              이현 <span style={{ color: '#C0622A' }}>❤️</span> 혜원
            </h1>
          </div>
          <div style={{
            background: remaining >= 0 ? 'rgba(95,138,110,0.3)' : 'rgba(217,64,64,0.3)',
            border: `1px solid ${remaining >= 0 ? 'rgba(95,138,110,0.5)' : 'rgba(217,64,64,0.5)'}`,
            borderRadius: 12,
            padding: '6px 12px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 10, color: '#A09080', marginBottom: 2 }}>변동지출 잔액</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: remaining >= 0 ? '#7FD4A0' : '#FF8080' }}>
              <AnimatedNumber value={remaining} suffix="원" />
            </p>
          </div>
        </div>

        {/* Budget overview pills */}
        <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
          {[
            { label: '총수입', value: BUDGET.income.total, color: '#7FD4A0' },
            { label: '고정지출', value: BUDGET.fixed.ihyeon + BUDGET.fixed.hyewon, color: '#E8A060' },
            { label: '저축+투자', value: BUDGET.savings + BUDGET.investment, color: '#8DB4E8' },
          ].map(item => (
            <div key={item.label} style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 10,
              padding: '6px 12px',
              flex: '1 1 auto',
            }}>
              <p style={{ fontSize: 10, color: '#806050', marginBottom: 2 }}>{item.label}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: item.color }}>
                {item.value.toLocaleString('ko-KR')}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* Savings & Investment */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {[
            { label: '💚 저축', target: BUDGET.savings, actual: BUDGET.savings, pct: 100 },
            { label: '📈 투자', target: BUDGET.investment, actual: BUDGET.investment, pct: 100 },
          ].map(item => (
            <div key={item.label} className="card" style={{ padding: 14 }}>
              <p style={{ fontSize: 12, color: '#9A8A7A', marginBottom: 6 }}>{item.label}</p>
              <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                {item.actual.toLocaleString('ko-KR')}
                <span style={{ fontSize: 10, color: '#9A8A7A' }}>원</span>
              </p>
              <div className="budget-bar-track">
                <div className="budget-bar-fill" style={{ width: `${item.pct}%`, background: '#5F8A6E' }} />
              </div>
              <p style={{ fontSize: 10, color: '#5F8A6E', marginTop: 4, textAlign: 'right' }}>
                ✓ 목표 달성!
              </p>
            </div>
          ))}
        </div>

        {/* Variable budget thermometers */}
        <div className="card" style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>🌡️ 변동지출 예산</h2>
            <span style={{ fontSize: 12, color: '#9A8A7A' }}>
              {formatKRW(spent)} / {formatKRW(BUDGET.variable)}
            </span>
          </div>

          {CATEGORIES.map(cat => {
            const budget = CAT_BUDGET[cat.id];
            const actual = totals[cat.id] || 0;
            if (budget === 0 && actual === 0) return null;
            const pct = budget > 0 ? actual / budget : actual > 0 ? 1 : 0;
            const barColor = getBarColor(pct);
            return (
              <div key={cat.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13 }}>{getCatLabel(cat.id)}</span>
                  <span style={{ fontSize: 12, color: '#9A8A7A' }}>
                    {actual > 0 ? actual.toLocaleString('ko-KR') : '-'}
                    {budget > 0 && <span> / {budget.toLocaleString('ko-KR')}</span>}
                  </span>
                </div>
                {budget > 0 && (
                  <div className="budget-bar-track">
                    <div
                      className="budget-bar-fill"
                      style={{
                        width: `${Math.min(pct * 100, 100)}%`,
                        background: barColor,
                      }}
                    />
                  </div>
                )}
                {pct >= 1 && (
                  <p style={{ fontSize: 10, color: '#D94040', marginTop: 3 }}>⚠️ 예산 초과!</p>
                )}
                {pct >= 0.8 && pct < 1 && (
                  <p style={{ fontSize: 10, color: '#E8A060', marginTop: 3 }}>🔸 예산의 80% 이상 소진</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Recent expenses */}
        <div className="card" style={{ padding: 16, marginBottom: 14 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>📅 최근 지출</h2>
          {recentFive.length === 0 ? (
            <p style={{ fontSize: 13, color: '#9A8A7A', textAlign: 'center', padding: '12px 0' }}>
              아직 지출 내역이 없어요 ✨
            </p>
          ) : (
            recentFive.map(e => (
              <div key={e.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 0',
                borderBottom: '1px solid #F0EBE3',
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: `${getCatColor(e.category)}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  flexShrink: 0,
                }}>
                  {getCatLabel(e.category).split(' ')[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 1 }}>
                    {e.merchant}
                  </p>
                  <p style={{ fontSize: 11, color: '#9A8A7A' }}>
                    {e.date.slice(5).replace('-', '/')} · {e.person}
                  </p>
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#D94040', flexShrink: 0 }}>
                  -{e.amount.toLocaleString('ko-KR')}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
