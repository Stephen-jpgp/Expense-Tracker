import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/');
    } catch (err) {
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>💰</div>
        <h1 style={styles.title}>Expense Tracker</h1>
        <p style={styles.subtitle}>Track your monthly spending, stay in control.</p>
        <div style={styles.loginBtn}>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => alert('Google login failed')}
            useOneTap
            size="large"
            shape="pill"
            text="signin_with"
          />
        </div>
        <p style={styles.note}>Only you can see your expenses.</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '1rem',
  },
  card: {
    background: '#fff',
    borderRadius: '1.5rem',
    padding: '2.5rem 2rem',
    textAlign: 'center',
    maxWidth: '360px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  icon: {
    fontSize: '3rem',
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#1a1a2e',
    margin: '0 0 0.5rem',
  },
  subtitle: {
    color: '#666',
    fontSize: '0.95rem',
    marginBottom: '2rem',
    lineHeight: 1.5,
  },
  loginBtn: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.25rem',
  },
  note: {
    fontSize: '0.8rem',
    color: '#aaa',
  },
};
