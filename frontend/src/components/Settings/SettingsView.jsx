import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useExpenses } from '../../contexts/ExpenseContext';
import { exportToXlsx } from '../../utils/exportXlsx';

export default function SettingsView() {
  const { user, updateSettings, logout } = useAuth();
  const { getAllExpenses, currentMonth, expenses } = useExpenses();

  const [limitInput, setLimitInput] = useState(user?.monthlyLimit || '');
  const [categories, setCategories] = useState(user?.categories || []);
  const [newCategory, setNewCategory] = useState('');
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSaveLimit = async () => {
    const val = parseFloat(limitInput);
    if (isNaN(val) || val < 0) {
      alert('Enter a valid amount');
      return;
    }
    await updateSettings({ monthlyLimit: val, categories });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addCategory = () => {
    const cat = newCategory.trim();
    if (!cat) return;
    if (categories.includes(cat)) {
      alert('Category already exists');
      return;
    }
    setCategories((prev) => [...prev, cat]);
    setNewCategory('');
  };

  const removeCategory = (cat) => {
    setCategories((prev) => prev.filter((c) => c !== cat));
  };

  const handleExportMonth = () => {
    exportToXlsx(expenses, currentMonth);
  };

  const handleExportAll = async () => {
    setExporting(true);
    try {
      const all = await getAllExpenses();
      exportToXlsx(all, 'all-time');
    } catch {
      alert('Failed to export');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Settings</span>
      </div>

      <div style={styles.content}>
        {/* Profile */}
        <div style={styles.card}>
          <div style={styles.profileRow}>
            {user?.picture && (
              <img src={user.picture} alt="avatar" style={styles.avatar} referrerPolicy="no-referrer" />
            )}
            <div>
              <p style={styles.profileName}>{user?.name}</p>
              <p style={styles.profileEmail}>{user?.email}</p>
            </div>
          </div>
          <button style={styles.logoutBtn} onClick={logout}>Sign Out</button>
        </div>

        {/* Monthly Limit */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Monthly Limit</h3>
          <p style={styles.cardDesc}>Set the maximum you want to spend this month.</p>
          <div style={styles.inputRow}>
            <span style={styles.rupee}>₹</span>
            <input
              type="number"
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              placeholder="e.g. 15000"
              style={styles.input}
            />
          </div>
          <button style={styles.saveBtn} onClick={handleSaveLimit}>
            {saved ? 'Saved ✓' : 'Save Limit'}
          </button>
        </div>

        {/* Categories */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Categories</h3>
          <p style={styles.cardDesc}>Add or remove spending categories.</p>
          <div style={styles.catList}>
            {categories.map((cat) => (
              <div key={cat} style={styles.catChip}>
                <span>{cat}</span>
                <button style={styles.catRemove} onClick={() => removeCategory(cat)}>×</button>
              </div>
            ))}
          </div>
          <div style={styles.inputRow}>
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCategory()}
              placeholder="New category..."
              style={{ ...styles.input, flex: 1 }}
            />
            <button style={styles.addCatBtn} onClick={addCategory}>Add</button>
          </div>
          <button style={{ ...styles.saveBtn, marginTop: '0.75rem' }} onClick={handleSaveLimit}>
            {saved ? 'Saved ✓' : 'Save Categories'}
          </button>
        </div>

        {/* Export */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Export Data</h3>
          <p style={styles.cardDesc}>Download your expense data as an Excel file.</p>
          <div style={styles.exportRow}>
            <button style={styles.exportBtn} onClick={handleExportMonth}>
              Export This Month
            </button>
            <button
              style={{ ...styles.exportBtn, background: '#f0eeff', color: '#6c63ff' }}
              onClick={handleExportAll}
              disabled={exporting}
            >
              {exporting ? 'Exporting...' : 'Export All Time'}
            </button>
          </div>
        </div>
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
  card: {
    background: '#fff',
    borderRadius: '1rem',
    padding: '1rem',
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
  },
  cardTitle: {
    margin: '0 0 0.25rem',
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#333',
  },
  cardDesc: {
    margin: '0 0 0.75rem',
    fontSize: '0.8rem',
    color: '#aaa',
  },
  profileRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
  },
  profileName: {
    margin: 0,
    fontWeight: 700,
    fontSize: '0.95rem',
    color: '#333',
  },
  profileEmail: {
    margin: 0,
    fontSize: '0.8rem',
    color: '#aaa',
  },
  logoutBtn: {
    background: '#fff',
    border: '1px solid #ff4d4d',
    color: '#ff4d4d',
    borderRadius: '2rem',
    padding: '0.5rem 1.25rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  rupee: {
    fontSize: '1.1rem',
    color: '#555',
  },
  input: {
    flex: 1,
    border: '1px solid #ddd',
    borderRadius: '0.5rem',
    padding: '0.55rem 0.75rem',
    fontSize: '0.95rem',
    outline: 'none',
  },
  saveBtn: {
    background: '#6c63ff',
    color: '#fff',
    border: 'none',
    borderRadius: '2rem',
    padding: '0.6rem 1.5rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.85rem',
    width: '100%',
  },
  catList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
    marginBottom: '0.75rem',
  },
  catChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    background: '#f0eeff',
    color: '#6c63ff',
    borderRadius: '2rem',
    padding: '0.3rem 0.75rem',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  catRemove: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6c63ff',
    fontWeight: 700,
    fontSize: '1rem',
    lineHeight: 1,
    padding: 0,
  },
  addCatBtn: {
    background: '#6c63ff',
    color: '#fff',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.55rem 1rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.85rem',
    flexShrink: 0,
  },
  exportRow: {
    display: 'flex',
    gap: '0.5rem',
  },
  exportBtn: {
    flex: 1,
    background: '#6c63ff',
    color: '#fff',
    border: 'none',
    borderRadius: '0.75rem',
    padding: '0.65rem 0.5rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
};
