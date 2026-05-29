import { useState } from 'react';
import { BUDGET, getEggState, formatKRW, GOAL_JARS } from '../store';

function Jar({ jar }) {
  const pct = Math.min(jar.current / jar.target, 1);
  const h = Math.round(pct * 80); // max 80px fill

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Jar SVG */}
      <div style={{ position: 'relative', width: 80, height: 100, margin: '0 auto 8px' }}>
        <svg viewBox="0 0 80 100" width="80" height="100">
          {/* Jar body */}
          <rect x="10" y="20" width="60" height="72" rx="12" fill="#F5F0E8" stroke="#E0D5C8" strokeWidth="2" />
          {/* Fill */}
          {pct > 0 && (
            <clipPath id={`clip-${jar.id}`}>
              <rect x="12" y={20 + (72 - h)} width="56" height={h} rx="0" />
            </clipPath>
            )}
          {pct > 0 && (
            <rect
              x="12"
              y={20 + (72 - h)}
              width="56"
              height={h}
              rx={h >= 60 ? 10 : 0}
              fill="#C0622A"
              opacity="0.7"
              className="jar-fill-inner"
            />
          )}
          {/* Jar neck */}
          <rect x="22" y="12" width="36" height="12" rx="4" fill="#F5F0E8" stroke="#E0D5C8" strokeWidth="2" />
          {/* Jar lid */}
          <rect x="16" y="8" width="48" height="8" rx="4" fill="#C0622A" opacity="0.8" />
        </svg>
        {/* Percentage */}
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 10,
          fontWeight: 700,
          color: pct > 0.4 ? 'white' : '#9A8A7A',
        }}>
          {Math.round(pct * 100)}%
        </div>
      </div>
      <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{jar.label}</p>
      <p style={{ fontSize: 11, color: '#9A8A7A' }}>
        {jar.current.toLocaleString('ko-KR')} / {jar.target.toLocaleString('ko-KR')}
      </p>
    </div>
  );
}

function EggDisplay({ streak }) {
  const egg = getEggState(streak);
  const [wobble, setWobble] = useState(false);

  function handleTap() {
    setWobble(true);
    setTimeout(() => setWobble(false), 700);
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <button
        onClick={handleTap}
        style={{
          fontSize: 80,
          lineHeight: 1,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'block',
          margin: '0 auto 12px',
        }}
        className={wobble ? 'egg-wobble' : ''}
        title="탭해보세요!"
      >
        {egg.emoji}
      </button>
      <p style={{ fontSize: 18, fontWeight: 800, color: egg.color, marginBottom: 4 }}>
        {egg.label}
      </p>
      <p style={{ fontSize: 13, color: '#9A8A7A' }}>
        {streak}개월 연속 저축 달성
      </p>
      <p style={{ fontSize: 11, color: '#B0A090', marginTop: 6 }}>
        👆 탭하면 흔들려요
      </p>
    </div>
  );
}

const MILESTONE_LABELS = [
  { months: 1, emoji: '🥚', label: '첫 알' },
  { months: 2, emoji: '🥚✨', label: '알이 흔들려요' },
  { months: 4, emoji: '🐣', label: '부화 중!' },
  { months: 6, emoji: '🐓', label: '닭이 됐어요' },
  { months: 12, emoji: '🐉', label: '전설의 용!' },
];

export default function Challenge({ streak, savingsLog, jars }) {
  const currentMonthHit = savingsLog[savingsLog.length - 1]?.hit || false;
  const nextMilestone = MILESTONE_LABELS.find(m => m.months > streak) || MILESTONE_LABELS[MILESTONE_LABELS.length - 1];
  const toNext = nextMilestone.months - streak;

  return (
    <div className="screen" style={{ padding: '0 16px 80px' }}>
      <div style={{ padding: '24px 0 20px' }}>
        <p style={{ fontSize: 12, color: '#9A8A7A', marginBottom: 4 }}>2026년 5월</p>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>🏆 챌린지</h1>
      </div>

      {/* Streak */}
      <div className="card" style={{ padding: 20, marginBottom: 14, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span className="flame" style={{ fontSize: 32 }}>🔥</span>
          <span style={{ fontSize: 44, fontWeight: 900, color: '#C0622A' }}>{streak}</span>
          <span style={{ fontSize: 18, color: '#9A8A7A', alignSelf: 'flex-end', paddingBottom: 8 }}>개월</span>
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>절약 스트릭</p>
        <p style={{ fontSize: 12, color: '#9A8A7A' }}>
          {toNext}개월 더 달성하면 <strong style={{ color: '#C0622A' }}>{nextMilestone.emoji} {nextMilestone.label}</strong>
        </p>

        {/* Monthly dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          {savingsLog.slice(-6).map((log, i) => (
            <div
              key={log.month}
              title={log.month}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: log.hit ? '#C0622A' : '#F0EBE3',
                border: `2px solid ${log.hit ? '#C0622A' : '#E0D5C8'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}
            >
              {log.hit ? '✓' : '·'}
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: '#B0A090', marginTop: 6 }}>최근 6개월</p>

        {!currentMonthHit && (
          <div style={{
            background: '#FFF8F2',
            border: '1px solid #FFE0C8',
            borderRadius: 10,
            padding: '10px 14px',
            marginTop: 14,
            fontSize: 13,
            color: '#C0622A',
          }}>
            💪 이번 달 저축 목표까지 <strong>{formatKRW(BUDGET.savings)}</strong> 달성하면 스트릭 유지!
          </div>
        )}
      </div>

      {/* Egg */}
      <div className="card" style={{ padding: '20px 20px 24px', marginBottom: 14 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
          🥚 저축 알 키우기
        </h2>
        <EggDisplay streak={streak} />

        {/* Progress bar to next */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, color: '#9A8A7A' }}>
            <span>현재: {streak}개월</span>
            <span>목표: {nextMilestone.months}개월 {nextMilestone.emoji}</span>
          </div>
          <div className="budget-bar-track" style={{ height: 8 }}>
            <div
              className="budget-bar-fill"
              style={{
                width: `${Math.min((streak / nextMilestone.months) * 100, 100)}%`,
                background: 'linear-gradient(90deg, #C0622A, #E8A060)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Goal jars */}
      <div className="card" style={{ padding: 20, marginBottom: 14 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>🏺 목표 항아리</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {jars.map(jar => (
            <Jar key={jar.id} jar={jar} />
          ))}
        </div>
      </div>

      {/* Badge list */}
      <div className="card" style={{ padding: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>🏅 획득한 뱃지</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            { earned: streak >= 1, emoji: '🏃', label: '첫 걸음' },
            { earned: streak >= 2, emoji: '🔥', label: '2개월 스트릭' },
            { earned: streak >= 3, emoji: '💪', label: '3개월 달성' },
            { earned: streak >= 6, emoji: '🐉', label: '반년 용사' },
            { earned: true, emoji: '💑', label: '커플 가계부' },
            { earned: true, emoji: '📱', label: 'PWA 앱 사용' },
          ].map(badge => (
            <div
              key={badge.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 99,
                background: badge.earned ? '#FAF8F3' : '#F5F0E8',
                border: `1.5px solid ${badge.earned ? '#E0D5C8' : '#EDE6DC'}`,
                opacity: badge.earned ? 1 : 0.4,
              }}
            >
              <span style={{ fontSize: 16 }}>{badge.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: badge.earned ? 700 : 400, color: badge.earned ? '#1A1410' : '#9A8A7A' }}>
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
