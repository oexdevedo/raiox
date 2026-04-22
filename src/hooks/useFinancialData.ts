import { useState, useEffect, useCallback } from 'react';
import { Income, Expense, FinancialData, FinancialAnalysis } from '@/types/financial';
import { useAuth } from '@/contexts/AuthContext';
import { apiGetIncomes, apiAddIncome, apiDeleteIncome, apiGetExpenses, apiAddExpense, apiDeleteExpense } from '@/lib/api';

export const useFinancialData = () => {
  const { user } = useAuth();
  const [data, setData] = useState<FinancialData>({ incomes: [], expenses: [] });
  const [loading, setLoading] = useState(true);

  // Load from backend API
  useEffect(() => {
    if (!user) {
      setData({ incomes: [], expenses: [] });
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [incomes, expenses] = await Promise.all([
          apiGetIncomes(user.email),
          apiGetExpenses(user.email),
        ]);

        setData({
          incomes: incomes.map(i => ({
            id: String(i.id),
            description: i.description,
            amount: Number(i.amount),
            date: i.created_at,
          })),
          expenses: expenses.map(e => ({
            id: String(e.id),
            description: e.description,
            amount: Number(e.amount),
            category: e.category,
            date: e.created_at,
          })),
        });
      } catch (err) {
        console.error('Error loading financial data:', err);
      }
      setLoading(false);
    };

    loadData();
  }, [user]);

  const addIncome = useCallback(async (description: string, amount: number) => {
    if (!user) return;
    try {
      const result = await apiAddIncome(user.email, description, amount);
      const newIncome = result.income;
      setData(prev => ({
        ...prev,
        incomes: [{ id: String(newIncome.id), description: newIncome.description, amount: Number(newIncome.amount), date: newIncome.created_at }, ...prev.incomes],
      }));
    } catch (err) {
      console.error('Error adding income:', err);
    }
  }, [user]);

  const removeIncome = useCallback(async (id: string) => {
    if (!user) return;
    try {
      await apiDeleteIncome(id);
      setData(prev => ({ ...prev, incomes: prev.incomes.filter(i => i.id !== id) }));
    } catch (err) {
      console.error('Error removing income:', err);
    }
  }, [user]);

  const addExpense = useCallback(async (description: string, amount: number, category: string) => {
    if (!user) return;
    try {
      const result = await apiAddExpense(user.email, description, amount, category);
      const newExpense = result.expense;
      setData(prev => ({
        ...prev,
        expenses: [{ id: String(newExpense.id), description: newExpense.description, amount: Number(newExpense.amount), category: newExpense.category, date: newExpense.created_at }, ...prev.expenses],
      }));
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  }, [user]);

  const removeExpense = useCallback(async (id: string) => {
    if (!user) return;
    try {
      await apiDeleteExpense(id);
      setData(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
    } catch (err) {
      console.error('Error removing expense:', err);
    }
  }, [user]);

  const getAnalysis = (): FinancialAnalysis => {
    const totalIncome = data.incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalIncome - totalExpenses;

    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysRemaining = Math.max(1, lastDay.getDate() - today.getDate() + 1);

    const availableForSpending = Math.max(0, balance);
    const dailyLimit = availableForSpending / daysRemaining;
    const weeklyLimit = dailyLimit * 7;
    const monthlyLimit = availableForSpending;

    let status: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (totalExpenses > totalIncome) status = 'negative';
    else if (totalExpenses < totalIncome) status = 'positive';

    return { totalIncome, totalExpenses, balance, status, dailyLimit, weeklyLimit, monthlyLimit, daysRemaining };
  };

  const clearAllData = useCallback(async () => {
    if (!user) return;
    // Delete each item via API
    const deletePromises = [
      ...data.incomes.map(i => apiDeleteIncome(i.id)),
      ...data.expenses.map(e => apiDeleteExpense(e.id)),
    ];
    await Promise.allSettled(deletePromises);
    setData({ incomes: [], expenses: [] });
  }, [user, data]);

  return {
    incomes: data.incomes,
    expenses: data.expenses,
    addIncome,
    removeIncome,
    addExpense,
    removeExpense,
    getAnalysis,
    clearAllData,
    loading,
  };
};
