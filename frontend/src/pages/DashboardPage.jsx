import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAccounts, getTransactionsByUser, getUnreadCount, getUserLoans } from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [accRes, txRes, notifRes, loanRes] = await Promise.allSettled([
        getAccounts(user.userId),
        getTransactionsByUser(user.userId),
        getUnreadCount(user.userId),
        getUserLoans(user.userId),
      ]);
      if (accRes.status === 'fulfilled') setAccounts(accRes.value.data);
      if (txRes.status === 'fulfilled') setTransactions(txRes.value.data);
      if (notifRes.status === 'fulfilled') setUnread(notifRes.value.data.unreadCount || 0);
      if (loanRes.status === 'fulfilled') setLoans(loanRes.value.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0);
  const activeLoans = loans.filter((l) => l.status === 'DISBURSED' || l.status === 'APPROVED');

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Welcome back, {user.fullName} 👋</h2>
        <p>Here's an overview of your banking activity</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">💰</div>
          <div className="stat-info">
            <h3>${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
            <p>Total Balance</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">📊</div>
          <div className="stat-info">
            <h3>{accounts.length}</h3>
            <p>Active Accounts</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📋</div>
          <div className="stat-info">
            <h3>{transactions.length}</h3>
            <p>Transactions</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">🔔</div>
          <div className="stat-info">
            <h3>{unread}</h3>
            <p>Unread Notifications</p>
          </div>
        </div>
      </div>

      {/* Account Cards + Recent Transactions */}
      <div className="grid-2">
        <div>
          <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Your Accounts</h3>
          {accounts.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <p>No accounts yet. One will be created automatically!</p>
              </div>
            </div>
          ) : (
            accounts.map((acc) => (
              <div key={acc.id} className="account-card" style={{ marginBottom: 16 }}>
                <div className="account-card-number">{acc.accountNumber}</div>
                <div className="account-card-balance">
                  ${parseFloat(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="account-card-label">Available Balance</div>
                <div className="account-card-footer">
                  <span className="account-card-type">{acc.accountType}</span>
                  <span className="account-card-status">● {acc.status}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div>
          <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Recent Transactions</h3>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {transactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📄</div>
                <h3>No transactions yet</h3>
                <p>Make your first deposit to get started</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 5).map((tx) => (
                      <tr key={tx.id}>
                        <td>
                          <span style={{ marginRight: 8 }}>
                            {tx.type === 'DEPOSIT' ? '⬇️' : tx.type === 'WITHDRAWAL' ? '⬆️' : '↔️'}
                          </span>
                          {tx.type}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          ${parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <span className={`badge badge-${tx.status === 'COMPLETED' ? 'success' : 'warning'}`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active Loans */}
          {activeLoans.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Active Loans</h3>
              {activeLoans.map((loan) => (
                <div key={loan.id} className="card" style={{ marginBottom: 12 }}>
                  <div className="flex-between">
                    <div>
                      <div style={{ fontWeight: 600 }}>${parseFloat(loan.amount).toLocaleString()}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {loan.termMonths} months @ {loan.interestRate}%
                      </div>
                    </div>
                    <span className={`badge badge-${loan.status === 'DISBURSED' ? 'info' : 'success'}`}>
                      {loan.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
