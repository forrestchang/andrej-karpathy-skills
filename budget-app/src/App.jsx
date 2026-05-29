import { useState, useCallback } from 'react';
import { getInitialState, persistState } from './store';
import Home from './screens/Home';
import Input from './screens/Input';
import Report from './screens/Report';
import Challenge from './screens/Challenge';

const TABS = [
  { id: 'home', icon: '🏠', label: '홈' },
  { id: 'input', icon: '✏️', label: '입력' },
  { id: 'report', icon: '📊', label: '리포트' },
  { id: 'challenge', icon: '🏆', label: '챌린지' },
];

export default function App() {
  const [tab, setTab] = useState('home');
  const [state, setState] = useState(getInitialState);

  const updateState = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      persistState(next);
      return next;
    });
  }, []);

  function handleAddExpense(expense) {
    updateState(prev => ({ ...prev, expenses: [...prev.expenses, expense] }));
    setTab('home');
  }

  function handleAddMessage(msg) {
    updateState(prev => ({ ...prev, coupleMessages: [...prev.coupleMessages, msg] }));
  }

  return (
    <div id="app-shell">
      <div className="screen">
        {tab === 'home' && <Home expenses={state.expenses} />}
        {tab === 'input' && <Input onAdd={handleAddExpense} />}
        {tab === 'report' && (
          <Report
            expenses={state.expenses}
            coupleMessages={state.coupleMessages}
            onAddMessage={handleAddMessage}
          />
        )}
        {tab === 'challenge' && (
          <Challenge
            streak={state.streak}
            savingsLog={state.savingsLog}
            jars={state.jars}
          />
        )}
      </div>

      <nav className="bottom-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`nav-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="nav-icon">{t.icon}</span>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
