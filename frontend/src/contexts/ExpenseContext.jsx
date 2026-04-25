import { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';

const ExpenseContext = createContext(null);

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ totalSpent: 0, byCategory: [] });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const fetchExpenses = useCallback(async (month) => {
    const m = month || currentMonth;
    const res = await api.get(`/expenses?month=${m}`);
    setExpenses(res.data);
    return res.data;
  }, [currentMonth]);

  const fetchSummary = useCallback(async (month) => {
    const m = month || currentMonth;
    const res = await api.get(`/expenses/summary?month=${m}`);
    setSummary(res.data);
    return res.data;
  }, [currentMonth]);

  const addExpense = async (expenseData) => {
    const res = await api.post('/expenses', expenseData);
    setExpenses((prev) => [res.data, ...prev]);
    // Refresh summary
    await fetchSummary(currentMonth);
    return res.data;
  };

  const deleteExpense = async (id) => {
    await api.delete(`/expenses/${id}`);
    setExpenses((prev) => prev.filter((e) => e._id !== id));
    await fetchSummary(currentMonth);
  };

  const getAllExpenses = async () => {
    const res = await api.get('/expenses/all');
    return res.data;
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        summary,
        currentMonth,
        setCurrentMonth,
        fetchExpenses,
        fetchSummary,
        addExpense,
        deleteExpense,
        getAllExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpenseContext);
