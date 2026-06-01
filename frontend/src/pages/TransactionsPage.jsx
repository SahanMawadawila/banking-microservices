import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAccounts, deposit, withdraw, transfer, getTransactionsByUser } from '../services/api';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [modal, setModal] = useState(null); // 'deposit' | 'withdraw' | 'transfer'
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [accRes, txRes] = await Promise.all([
        getAccounts(user.userId),
        getTransactionsByUser(user.userId),
      ]);
      setAccounts(accRes.data);
      setTransactions(txRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await deposit({
        accountNumber: form.accountNumber,
        amount: parseFloat(form.amount),
        description: form.description || 'Deposit',
        userId: user.userId,
      });
      showToast('Deposit successful!');
      setModal(null);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Deposit failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await withdraw({
        accountNumber: form.accountNumber,
        amount: parseFloat(form.amount),
        description: form.description || 'Withdrawal',
        userId: user.userId,
      });
      showToast('Withdrawal successful!');
      setModal(null);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Withdrawal failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await transfer({
        fromAccountNumber: form.fromAccountNumber,
        toAccountNumber: form.toAccountNumber,
        amount: parseFloat(form.amount),
        description: form.description || 'Transfer',
        userId: user.userId,
      });
      showToast('Transfer successful!');
      setModal(null);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Transfer failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (type) => {
    setForm(type === 'transfer'
      ? { fromAccountNumber: accounts[0]?.accountNumber || '', toAccountNumber: '', amount: '', description: '' }
      : { accountNumber: accounts[0]?.accountNumber || '', amount: '', description: '' }
    );
    setModal(type);
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h2>Transactions</h2>
        <p>Manage your deposits, withdrawals, and transfers</p>
      </div>

      <div className="actions-row">
        <button className="btn btn-success" onClick={() => openModal('deposit')}>⬇️ Deposit</button>
        <button className="btn btn-danger" onClick={() => openModal('withdraw')}>⬆️ Withdraw</button>
        <button className="btn btn-primary" onClick={() => openModal('transfer')}>↔️ Transfer</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <h3>No transactions yet</h3>
            <p>Start by making a deposit</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <span className={`badge ${tx.type === 'DEPOSIT' ? 'badge-success' : tx.type === 'WITHDRAWAL' ? 'badge-danger' : 'badge-info'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{tx.fromAccountNumber || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{tx.toAccountNumber || '—'}</td>
                    <td style={{ fontWeight: 600 }}>
                      ${parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{tx.description}</td>
                    <td>
                      <span className={`badge badge-${tx.status === 'COMPLETED' ? 'success' : 'warning'}`}>{tx.status}</span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === 'deposit' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💰 Deposit Money</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <form onSubmit={handleDeposit}>
              <div className="form-group">
                <label className="form-label">Account</label>
                <select className="form-input" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}>
                  {accounts.map((a) => <option key={a.id} value={a.accountNumber}>{a.accountNumber} ({a.accountType})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount ($)</label>
                <input type="number" className="form-input" placeholder="0.00" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <input type="text" className="form-input" placeholder="Salary, gift, etc." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-success btn-block" disabled={submitting}>
                {submitting ? 'Processing...' : 'Deposit'}
              </button>
            </form>
          </div>
        </div>
      )}

      {modal === 'withdraw' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💸 Withdraw Money</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <form onSubmit={handleWithdraw}>
              <div className="form-group">
                <label className="form-label">Account</label>
                <select className="form-input" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}>
                  {accounts.map((a) => <option key={a.id} value={a.accountNumber}>{a.accountNumber} — ${parseFloat(a.balance).toFixed(2)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount ($)</label>
                <input type="number" className="form-input" placeholder="0.00" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <input type="text" className="form-input" placeholder="ATM, bills, etc." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-danger btn-block" disabled={submitting}>
                {submitting ? 'Processing...' : 'Withdraw'}
              </button>
            </form>
          </div>
        </div>
      )}

      {modal === 'transfer' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔄 Transfer Money</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <form onSubmit={handleTransfer}>
              <div className="form-group">
                <label className="form-label">From Account</label>
                <select className="form-input" value={form.fromAccountNumber} onChange={(e) => setForm({ ...form, fromAccountNumber: e.target.value })}>
                  {accounts.map((a) => <option key={a.id} value={a.accountNumber}>{a.accountNumber} — ${parseFloat(a.balance).toFixed(2)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">To Account Number</label>
                <input type="text" className="form-input" placeholder="BNK..." value={form.toAccountNumber} onChange={(e) => setForm({ ...form, toAccountNumber: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Amount ($)</label>
                <input type="number" className="form-input" placeholder="0.00" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <input type="text" className="form-input" placeholder="Reason for transfer" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? 'Processing...' : 'Transfer'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
        </div>
      )}
    </div>
  );
}
