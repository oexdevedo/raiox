const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002';

const apiFetch = async <T = unknown>(path: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro na requisição');
  return data as T;
};

export const apiRegister = (payload: {
  name: string;
  email: string;
  region?: string;
  birth_date?: string;
  whatsapp?: string;
  profession?: string;
  gender?: string;
}) => apiFetch<{ success: boolean; user: ApiUser }>('/api/register', {
  method: 'POST',
  body: JSON.stringify(payload),
});

export const apiCheckUser = (email: string) =>
  apiFetch<{ exists: boolean; user: ApiUser | null }>(`/api/check-user/${encodeURIComponent(email)}`);

export const apiLogin = (email: string, password: string) =>
  apiFetch<{ success: boolean; isAdmin: boolean; user: ApiUser }>('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const apiGetUsers = () =>
  apiFetch<ApiUser[]>('/api/users');

export const apiGetInteractions = () =>
  apiFetch<any[]>('/api/interactions');

export const apiDeleteUser = (email: string) =>
  apiFetch(`/api/users/${encodeURIComponent(email)}`, { method: 'DELETE' });

export const apiUpdateUser = (email: string, updates: Partial<ApiUser>) =>
  apiFetch(`/api/users/${encodeURIComponent(email)}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });

// ── Admins ────────────────────────────────────────────────────────────────────
export const apiGetAdmins = () =>
  apiFetch<ApiAdmin[]>('/api/admins');

export const apiCreateAdmin = (email: string, password: string) =>
  apiFetch<{ success: boolean; error?: string }>('/api/admins', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const apiDeleteAdmin = (email: string) =>
  apiFetch(`/api/admins/${encodeURIComponent(email)}`, { method: 'DELETE' });

// ── Incomes ───────────────────────────────────────────────────────────────────
export const apiGetIncomes = (email: string) =>
  apiFetch<ApiIncome[]>(`/api/incomes/${encodeURIComponent(email)}`);

export const apiAddIncome = (user_email: string, description: string, amount: number) =>
  apiFetch<{ success: boolean; income: ApiIncome }>('/api/incomes', {
    method: 'POST',
    body: JSON.stringify({ user_email, description, amount }),
  });

export const apiDeleteIncome = (id: number | string) =>
  apiFetch(`/api/incomes/${id}`, { method: 'DELETE' });

// ── Expenses ──────────────────────────────────────────────────────────────────
export const apiGetExpenses = (email: string) =>
  apiFetch<ApiExpense[]>(`/api/expenses/${encodeURIComponent(email)}`);

export const apiAddExpense = (user_email: string, description: string, amount: number, category: string) =>
  apiFetch<{ success: boolean; expense: ApiExpense }>('/api/expenses', {
    method: 'POST',
    body: JSON.stringify({ user_email, description, amount, category }),
  });

export const apiDeleteExpense = (id: number | string) =>
  apiFetch(`/api/expenses/${id}`, { method: 'DELETE' });

// ── Behavioral ────────────────────────────────────────────────────────────────
export const apiGetBehavioral = (email: string) =>
  apiFetch<ApiBehavioral | null>(`/api/behavioral/${encodeURIComponent(email)}`);

export const apiSaveBehavioral = (payload: {
  user_email: string;
  answers: Record<number, number>;
  total_score: number;
  total_percentage: number;
  level: string;
}) => apiFetch('/api/behavioral', {
  method: 'POST',
  body: JSON.stringify(payload),
});

// ── Custom Buttons ────────────────────────────────────────────────────────────
export const apiGetCustomButtons = () =>
  apiFetch<Record<string, unknown>>('/api/custom-buttons');

export const apiSaveCustomButtons = (config: Record<string, unknown>) =>
  apiFetch('/api/custom-buttons', {
    method: 'POST',
    body: JSON.stringify(config),
  });

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ApiUser {
  id: number;
  name: string;
  email: string;
  gender: string;
  region: string;
  birth_date: string;
  whatsapp: string;
  profession: string;
  contact_status: string;
  last_contact_at: string | null;
  created_at: string;
}

export interface ApiAdmin {
  id: number;
  email: string;
  created_at: string;
}

export interface ApiIncome {
  id: number;
  user_email: string;
  description: string;
  amount: number;
  created_at: string;
}

export interface ApiExpense {
  id: number;
  user_email: string;
  description: string;
  amount: number;
  category: string;
  created_at: string;
}

export interface ApiBehavioral {
  id: number;
  user_email: string;
  answers: string;
  total_score: number;
  total_percentage: number;
  level: string;
  created_at: string;
  updated_at: string;
}
