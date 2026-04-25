import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useExpenses } from '../../contexts/ExpenseContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const COLORS = ['#6c63ff', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#f093fb'];

export default function DashboardView() {
  const { user } = useAuth();
  const { summary, fetchSummary, currentMonth, setCurrentMonth } = useExpenses();

  useEffect(() => {
    fetchSummary(currentMonth);
  }, [currentMonth]);

  const { totalSpent, byCategory } = summary;
  const limit = user?.monthlyLimit || 0;
  const remaining = limit > 0 ? limit - totalSpent : null;
  const pct = limit > 0 ? Math.min((totalSpent / limit) * 100, 100) : 0;

  const barColor =
    pct >= 90 ? '#FF4D4D' :
    pct >= 70 ? '#FFA500' :
    '#6c63ff';

  // Month navigation helpers
  const changeMonth = (dir) => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(newMonth);
    fetchSummary(newMonth);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>Dashboard</span>
      </div>

      <div style={styles.content}>
        {/* Month selector */}
        <div style={styles.monthRow}>
          <button style={styles.monthBtn} onClick={() => changeMonth(-1)}>{'<'}</button>
          <span style={styles.monthText}>{currentMonth}</span>
          <button style={styles.monthBtn} onClick={() => changeMonth(1)}>{'>'}</button>
        </div>

        {/* Budget overview */}
        <div style={styles.card}>
          <div style={styles.statRow}>
            <div style={styles.stat}>
              <span style={styles.statLabel}>Spent</span>
              <span style={styles.statValue}>₹{totalSpent.toLocaleString()}</span>
            </div>
            {limit > 0 && (
              <>
                <div style={styles.statDivider} />
                <div style={styles.stat}>
                  <span style={styles.statLabel}>Limit</span>
                  <span style={styles.statValue}>₹{limit.toLocaleString()}</span>
                </div>
                <div style={styles.statDivider} />
                <div style={styles.stat}>
                  <span style={styles.statLabel}>Left</span>
                  <span style={{ ...styles.statValue, color: remaining < 0 ? '#FF4D4D' : '#22c55e' }}>
                    {remaining < 0 ? '-' : ''}₹{Math.abs(remaining).toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>

          {limit > 0 && (
            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressBar,
                  width: `${pct}%`,
                  background: barColor,
                }}
              />
            </div>
          )}
          {limit > 0 && (
            <p style={{ ...styles.pctText, color: barColor }}>
              {pct.toFixed(0)}% of monthly budget used
            </p>
          )}
          {!limit && (
            <p style={styles.setLimitHint}>Set a monthly limit in Settings to track your budget.</p>
          )}
        </div>

        {/* Category breakdown */}
        {byCategory.length > 0 ? (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>By Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byCategory} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => `₹${val}`} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {byCategory.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Legend list */}
            <div style={styles.legendList}>
              {byCategory.map((item, i) => (
                <div key={item.category} style={styles.legendItem}>
                  <div style={{ ...styles.legendDot, background: COLORS[i % COLORS.length] }} />
                  <span style={styles.legendName}>{item.category}</span>
                  <span style={styles.legendCount}>{item.count} entries</span>
                  <span style={styles.legendAmt}>₹{item.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={styles.emptyCard}>
            <p>No expenses logged for {currentMonth} yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#f0f0f5',
  },
  header: {
    background: '#6c63ff',
    color: '#fff',
    padding: '1rem 1.25rem 0.75rem',
  },
  headerTitle: {
    fontWeight: 700,
    fontSize: '1.1rem',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  monthRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
  },
  monthBtn: {
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.9rem',
  },
  monthText: {
    fontWeight: 600,
    fontSize: '1rem',
    color: '#333',
  },
  card: {
    background: '#fff',
    borderRadius: '1rem',
    padding: '1rem',
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
  },
  cardTitle: {
    margin: '0 0 0.75rem',
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#333',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '0.75rem',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#aaa',
    fontWeight: 500,
  },
  statValue: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#333',
  },
  statDivider: {
    width: '1px',
    background: '#eee',
  },
  progressTrack: {
    height: '8px',
    background: '#eee',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '0.4rem',
  },
  progressBar: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.4s ease',
  },
  pctText: {
    margin: 0,
    fontSize: '0.75rem',
    textAlign: 'right',
    fontWeight: 600,
  },
  setLimitHint: {
    margin: 0,
    fontSize: '0.8rem',
    color: '#aaa',
    textAlign: 'center',
  },
  legendList: {
    marginTop: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  legendName: {
    flex: 1,
    fontSize: '0.85rem',
    color: '#444',
    fontWeight: 500,
  },
  legendCount: {
    fontSize: '0.75rem',
    color: '#aaa',
  },
  legendAmt: {
    fontWeight: 700,
    fontSize: '0.9rem',
    color: '#333',
  },
  emptyCard: {
    background: '#fff',
    borderRadius: '1rem',
    padding: '2rem',
    textAlign: 'center',
    color: '#aaa',
    fontSize: '0.9rem',
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
  },
};
