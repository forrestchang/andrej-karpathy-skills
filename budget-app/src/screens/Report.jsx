import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import {
  CATEGORIES, CAT_BUDGET,
  getMonthExpenses, getCategoryTotals, getTotalSpent,
  getCatColor, getCatLabel, formatKRW, BUDGET,
} from '../store';

const CURRENT_MONTH = '2026-05';

const CUSTOM_TOOLTIP = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid #E0D5C8',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 12,
      }}>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color, marginBottom: 2 }}>
            {p.name}: {p.value.toLocaleString('ko-KR')}원
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Report({ expenses, coupleMessages, onAddMessage }) {
  const monthExp = getMonthExpenses(expenses, CURRENT_MONTH);
  const totals = getCategoryTotals(monthExp);
  const spent = getTotalSpent(monthExp);
  const [msg, setMsg] = useState({ text: '', person: '이현' });
  const [msgSaved, setMsgSaved] = useState(false);

  const barData = CATEGORIES
    .filter(c => CAT_BUDGET[c.id] > 0 || totals[c.id] > 0)
    .map(c => ({
      name: c.label.split(' ')[0] + ' ' + c.id,
      예산: CAT_BUDGET[c.id] || 0,
      실지출: totals[c.id] || 0,
      color: c.color,
    }));

  const pieData = CATEGORIES
    .filter(c => totals[c.id] > 0)
    .map(c => ({
      name: getCatLabel(c.id),
      value: totals[c.id],
      color: c.color,
    }));

  function handleMsgSubmit(e) {
    e.preventDefault();
    if (!msg.text.trim()) return;
    onAddMessage({ ...msg, month: CURRENT_MONTH, id: Date.now().toString() });
    setMsg(m => ({ ...m, text: '' }));
    setMsgSaved(true);
    setTimeout(() => setMsgSaved(false), 2000);
  }

  const savings_rate = ((BUDGET.savings + BUDGET.investment) / BUDGET.income.total * 100).toFixed(1);
  const variable_rate = (spent / BUDGET.variable * 100).toFixed(0);

  return (
    <div className="screen" style={{ padding: '0 16px 80px' }}>
      <div style={{ padding: '24px 0 20px' }}>
        <p style={{ fontSize: 12, color: '#9A8A7A', marginBottom: 4 }}>2026년 5월</p>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>📊 월별 리포트</h1>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[
          { label: '총 변동지출', value: formatKRW(spent), sub: `예산의 ${variable_rate}% 사용`, ok: spent <= BUDGET.variable },
          { label: '절약 금액', value: formatKRW(Math.max(BUDGET.variable - spent, 0)), sub: `잔액 ${Math.max(BUDGET.variable - spent, 0) > 0 ? '있음 🎉' : '초과 😅'}`, ok: BUDGET.variable - spent > 0 },
          { label: '저축+투자', value: formatKRW(BUDGET.savings + BUDGET.investment), sub: `수입의 ${savings_rate}%`, ok: true },
          { label: '지출 건수', value: `${monthExp.length}건`, sub: `이현 ${monthExp.filter(e => e.person === '이현').length}건 / 혜원 ${monthExp.filter(e => e.person === '혜원').length}건`, ok: true },
        ].map(item => (
          <div key={item.label} className="card" style={{ padding: 14 }}>
            <p style={{ fontSize: 11, color: '#9A8A7A', marginBottom: 4 }}>{item.label}</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: item.ok ? '#1A1410' : '#D94040', marginBottom: 3 }}>
              {item.value}
            </p>
            <p style={{ fontSize: 11, color: item.ok ? '#5F8A6E' : '#E8A060' }}>{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="card" style={{ padding: '16px 8px', marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, paddingLeft: 8, marginBottom: 14 }}>
          예산 vs 실지출
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} barGap={4} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#9A8A7A' }}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 9, fill: '#B0A090' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => v >= 1000 ? `${v/1000}k` : v}
            />
            <Tooltip content={<CUSTOM_TOOLTIP />} />
            <Bar dataKey="예산" fill="#E0D5C8" radius={[4, 4, 0, 0]} maxBarSize={18} />
            <Bar dataKey="실지출" radius={[4, 4, 0, 0]} maxBarSize={18}>
              {barData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.실지출 > entry.예산 ? '#D94040' : entry.color}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9A8A7A' }}>
            <div style={{ width: 10, height: 10, background: '#E0D5C8', borderRadius: 2 }} />예산
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9A8A7A' }}>
            <div style={{ width: 10, height: 10, background: '#C0622A', borderRadius: 2 }} />실지출
          </div>
        </div>
      </div>

      {/* Pie chart */}
      {pieData.length > 0 && (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>카테고리 비중</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={v => `${v.toLocaleString('ko-KR')}원`} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Couple messages */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>💬 커플 한마디</h2>
        <p style={{ fontSize: 12, color: '#9A8A7A', marginBottom: 14 }}>이번 달 서로에게 한 줄 남기기</p>

        {coupleMessages.filter(m => m.month === CURRENT_MONTH).map(m => (
          <div key={m.id} style={{
            background: '#FAF8F3',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 8,
          }}>
            <p style={{ fontSize: 11, color: '#9A8A7A', marginBottom: 3 }}>
              {m.person} · {CURRENT_MONTH}
            </p>
            <p style={{ fontSize: 14 }}>{m.text}</p>
          </div>
        ))}

        {msgSaved && (
          <p className="slide-up" style={{ color: '#5F8A6E', fontSize: 13, marginBottom: 8, fontWeight: 600 }}>
            💚 메시지가 저장됐어요!
          </p>
        )}

        <form onSubmit={handleMsgSubmit}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {['이현', '혜원'].map(p => (
              <button
                type="button"
                key={p}
                onClick={() => setMsg(m => ({ ...m, person: p }))}
                style={{
                  padding: '6px 14px',
                  borderRadius: 99,
                  border: `2px solid ${msg.person === p ? '#C0622A' : '#E0D5C8'}`,
                  background: msg.person === p ? '#C0622A' : 'white',
                  color: msg.person === p ? 'white' : '#7A6A5A',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="이번 달 한마디..."
              value={msg.text}
              onChange={e => setMsg(m => ({ ...m, text: e.target.value }))}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 10,
                border: '1.5px solid #E0D5C8',
                fontSize: 13,
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                background: '#C0622A',
                color: 'white',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              전송
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
