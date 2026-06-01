import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import TransactionsPage from './pages/TransactionsPage';
import LoansPage from './pages/LoansPage';
import NotificationsPage from './pages/NotificationsPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" />;
  return children;
}

function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/accounts', icon: '🏦', label: 'My Accounts' },
    { path: '/transactions', icon: '💸', label: 'Transactions' },
    { path: '/loans', icon: '📋', label: 'Loans' },
    { path: '/notifications', icon: '🔔', label: 'Notifications' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🏦</div>
        <h1>NovaBank</h1>
      </div>
      
      <div className="sidebar-nav">
        {links.map((link) => (
          <button
            key={link.path}
            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            onClick={() => navigate(link.path)}
          >
            <span className="nav-link-icon">{link.icon}</span>
            {link.label}
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="nav-link" onClick={onLogout}>
          <span className="nav-link-icon">🚪</span>
          Sign Out
        </button>
      </div>
    </div>
  );
}

function Layout({ children }) {
  const { logout } = useAuth();
  return (
    <div className="app-layout">
      <Sidebar onLogout={logout} />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();
  const [authView, setAuthView] = useState('login');

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={
          isAuthenticated ? (
            <Navigate to="/" />
          ) : authView === 'login' ? (
            <LoginPage onSwitch={() => setAuthView('register')} />
          ) : (
            <RegisterPage onSwitch={() => setAuthView('login')} />
          )
        } 
      />
      
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/accounts" element={<AccountsPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/loans" element={<LoansPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
