import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { path: '/',          label: 'Chat',      icon: '💬' },
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/settings',  label: 'Settings',  icon: '⚙️' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav style={styles.nav}>
      {tabs.map((tab) => {
        const active = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{ ...styles.tab, ...(active ? styles.activeTab : {}) }}
          >
            <span style={styles.icon}>{tab.icon}</span>
            <span style={{ ...styles.label, ...(active ? styles.activeLabel : {}) }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

const styles = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '64px',
    background: '#fff',
    borderTop: '1px solid #eee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 100,
    boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
  },
  tab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    gap: '2px',
  },
  activeTab: {
    background: 'none',
  },
  icon: {
    fontSize: '1.4rem',
  },
  label: {
    fontSize: '0.7rem',
    color: '#aaa',
    fontWeight: 500,
  },
  activeLabel: {
    color: '#6c63ff',
    fontWeight: 700,
  },
};
