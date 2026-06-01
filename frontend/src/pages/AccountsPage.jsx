import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAccounts } from '../services/api';

export default function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const res = await getAccounts(user.userId);
      setAccounts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h2>My Accounts</h2>
        <p>Manage and view your bank accounts</p>
      </div>

      {accounts.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🏦</div>
            <h3>No accounts found</h3>
            <p>Your savings account is being set up automatically</p>
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {accounts.map((acc) => (
            <div key={acc.id}>
              <div className="account-card">
                <div className="account-card-number">{acc.accountNumber}</div>
                <div className="account-card-balance">
                  ${parseFloat(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="account-card-label">Available Balance • {acc.currency}</div>
                <div className="account-card-footer">
                  <span className="account-card-type">{acc.accountType}</span>
                  <span className="account-card-status">● {acc.status}</span>
                </div>
              </div>

              <div className="card" style={{ marginTop: 16 }}>
                <h4 style={{ marginBottom: 12, fontWeight: 600 }}>Account Details</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="flex-between">
                    <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Account Number</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{acc.accountNumber}</span>
                  </div>
                  <div className="flex-between">
                    <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Type</span>
                    <span style={{ fontSize: 13 }}>{acc.accountType}</span>
                  </div>
                  <div className="flex-between">
                    <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Currency</span>
                    <span style={{ fontSize: 13 }}>{acc.currency}</span>
                  </div>
                  <div className="flex-between">
                    <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Status</span>
                    <span className={`badge ${acc.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>{acc.status}</span>
                  </div>
                  <div className="flex-between">
                    <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Created</span>
                    <span style={{ fontSize: 13 }}>{new Date(acc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
