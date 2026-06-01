import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserLoans, applyLoan, approveLoan, rejectLoan, disburseLoan, getAccounts } from '../services/api';

export default function LoansPage() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ amount: '', termMonths: '12', purpose: '', accountNumber: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loanRes, accRes] = await Promise.all([
        getUserLoans(user.userId),
        getAccounts(user.userId),
      ]);
      setLoans(loanRes.data);
      setAccounts(accRes.data);
      if (accRes.data.length > 0) {
        setForm((f) => ({ ...f, accountNumber: accRes.data[0].accountNumber }));
      }
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

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await applyLoan({
        userId: user.userId,
        accountNumber: form.accountNumber,
        amount: parseFloat(form.amount),
        termMonths: parseInt(form.termMonths),
        purpose: form.purpose,
      });
      showToast('Loan application submitted!');
      setShowModal(false);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Application failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') await approveLoan(id);
      if (action === 'reject') await rejectLoan(id);
      if (action === 'disburse') await disburseLoan(id);
      showToast(`Loan ${action}d successfully!`);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || `Failed to ${action}`, 'error');
    }
  };

  const statusBadge = (status) => {
    const map = {
      PENDING: 'badge-warning',
      APPROVED: 'badge-success',
      REJECTED: 'badge-danger',
      DISBURSED: 'badge-info',
      CLOSED: 'badge-purple',
    };
    return map[status] || 'badge-info';
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h2>Loans</h2>
          <p>Apply for loans and manage existing applications</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>📝 Apply for Loan</button>
      </div>

      {loans.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No loan applications</h3>
            <p>Click "Apply for Loan" to get started</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Interest</th>
                  <th>Term</th>
                  <th>Purpose</th>
                  <th>Account</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id}>
                    <td>#{loan.id}</td>
                    <td style={{ fontWeight: 600 }}>${parseFloat(loan.amount).toLocaleString()}</td>
                    <td>{loan.interestRate}%</td>
                    <td>{loan.termMonths} mo</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{loan.purpose || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{loan.accountNumber || '—'}</td>
                    <td><span className={`badge ${statusBadge(loan.status)}`}>{loan.status}</span></td>
                    <td>
                      <div className="flex-gap">
                        {loan.status === 'PENDING' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => handleAction(loan.id, 'approve')}>Approve</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleAction(loan.id, 'reject')}>Reject</button>
                          </>
                        )}
                        {loan.status === 'APPROVED' && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleAction(loan.id, 'disburse')}>Disburse</button>
                        )}
                        {(loan.status === 'DISBURSED' || loan.status === 'REJECTED' || loan.status === 'CLOSED') && (
                          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📝 Apply for a Loan</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleApply}>
              <div className="form-group">
                <label className="form-label">Disbursement Account</label>
                <select className="form-input" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}>
                  {accounts.map((a) => <option key={a.id} value={a.accountNumber}>{a.accountNumber} ({a.accountType})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Loan Amount ($)</label>
                <input type="number" className="form-input" placeholder="Min $100" min="100" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Term (months)</label>
                <select className="form-input" value={form.termMonths} onChange={(e) => setForm({ ...form, termMonths: e.target.value })}>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="24">24 months</option>
                  <option value="36">36 months</option>
                  <option value="48">48 months</option>
                  <option value="60">60 months</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Purpose</label>
                <input type="text" className="form-input" placeholder="Home, education, business..." value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
        </div>
      )}
    </div>
  );
}
