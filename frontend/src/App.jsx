import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ExpenseProvider } from './contexts/ExpenseContext';
import Login from './pages/Login';
import BottomNav from './components/BottomNav';
import ChatView from './components/Chat/ChatView';
import DashboardView from './components/Dashboard/DashboardView';
import SettingsView from './components/Settings/SettingsView';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <span style={styles.loadingIcon}>💰</span>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <ExpenseProvider>
      <div style={styles.appShell}>
        <div style={styles.pageContent}>
          <Routes>
            <Route path="/" element={<ChatView />} />
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/settings" element={<SettingsView />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </ExpenseProvider>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

const styles = {
  appShell: {
    maxWidth: '480px',
    margin: '0 auto',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  pageContent: {
    flex: 1,
    overflow: 'hidden',
    paddingBottom: '64px', // space for bottom nav
    display: 'flex',
    flexDirection: 'column',
  },
  loadingScreen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '0.5rem',
  },
  loadingIcon: {
    fontSize: '2.5rem',
  },
  loadingText: {
    color: '#aaa',
    fontSize: '0.9rem',
  },
};
