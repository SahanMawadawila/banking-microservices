import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => api.post('/identity/register', data);
export const login = (data) => api.post('/identity/login', data);

// Accounts
export const getAccounts = (userId) => api.get(`/accounts/user/${userId}`);
export const getAccountByNumber = (num) => api.get(`/accounts/number/${num}`);

// Transactions
export const deposit = (data) => api.post('/transactions/deposit', data);
export const withdraw = (data) => api.post('/transactions/withdraw', data);
export const transfer = (data) => api.post('/transactions/transfer', data);
export const getTransactions = (accountNumber) => api.get(`/transactions/account/${accountNumber}`);
export const getTransactionsByUser = (userId) => api.get(`/transactions/user/${userId}`);

// Loans
export const applyLoan = (data) => api.post('/loans/apply', data);
export const getUserLoans = (userId) => api.get(`/loans/user/${userId}`);
export const approveLoan = (id) => api.put(`/loans/${id}/approve`);
export const rejectLoan = (id) => api.put(`/loans/${id}/reject`);
export const disburseLoan = (id) => api.put(`/loans/${id}/disburse`);

// Notifications
export const getNotifications = (userId) => api.get(`/notifications/${userId}`);
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const getUnreadCount = (userId) => api.get(`/notifications/${userId}/unread-count`);

export default api;
