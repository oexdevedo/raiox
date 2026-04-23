const API_BASE = import.meta.env.VITE_API_URL || '/api';

const request = async (path: string, options: RequestInit = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API Error');
  return data;
};

// ── Auth & Users ─────────────────────────────────────────────────────────────

export const apiRegister = async (payload: {
  name: string;
  email: string;
  region?: string;
  birth_date?: string;
  whatsapp?: string;
  profession?: string;
  gender?: string;
}) => {
  return request('/api/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const apiCheckUser = async (email: string) => {
  return request(`/api/check-user/${encodeURIComponent(email)}`);
};

export const apiLogin = async (email: string, password: string) => {
  return request('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const apiGetUsers = async () => {
  return request('/api/users');
};

export const apiUpdateUser = async (email: string, updates: Partial<ApiUser>) => {
  return request(`/api/users/${encodeURIComponent(email)}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

export const apiDeleteUser = async (email: string) => {
  return request(`/api/users/${encodeURIComponent(email)}`, {
    method: 'DELETE',
  });
};

// ── Admins ────────────────────────────────────────────────────────────────────

export const apiGetAdmins = async () => {
  return request('/api/admins');
};

export const apiCreateAdmin = async (email: string, password?: string) => {
  return request('/api/admins', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const apiDeleteAdmin = async (email: string) => {
  return request(`/api/admins/${encodeURIComponent(email)}`, {
    method: 'DELETE',
  });
};

// ── Incomes ───────────────────────────────────────────────────────────────────

export const apiGetIncomes = async (email: string) => {
  return request(`/api/incomes/${encodeURIComponent(email)}`);
};

export const apiAddIncome = async (user_email: string, description: string, amount: number) => {
  return request('/api/incomes', {
    method: 'POST',
    body: JSON.stringify({ user_email, description, amount }),
  });
};

export const apiDeleteIncome = async (id: string | number) => {
  return request(`/api/incomes/${id}`, {
    method: 'DELETE',
  });
};

// ── Expenses ──────────────────────────────────────────────────────────────────

export const apiGetExpenses = async (email: string) => {
  return request(`/api/expenses/${encodeURIComponent(email)}`);
};

export const apiAddExpense = async (user_email: string, description: string, amount: number, category: string) => {
  return request('/api/expenses', {
    method: 'POST',
    body: JSON.stringify({ user_email, description, amount, category }),
  });
};

export const apiDeleteExpense = async (id: string | number) => {
  return request(`/api/expenses/${id}`, {
    method: 'DELETE',
  });
};

// ── Behavioral ────────────────────────────────────────────────────────────────

export const apiGetBehavioral = async (email: string) => {
  return request(`/api/behavioral/${encodeURIComponent(email)}`);
};

export const apiSaveBehavioral = async (payload: {
  user_email: string;
  answers: Record<number, number>;
  total_score: number;
  total_percentage: number;
  level: string;
}) => {
  return request('/api/behavioral', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// ── Custom Buttons ────────────────────────────────────────────────────────────

export const apiGetCustomButtons = async () => {
  return request('/api/custom-buttons');
};

export const apiSaveCustomButtons = async (config: Record<string, unknown>) => {
  return request('/api/custom-buttons', {
    method: 'POST',
    body: JSON.stringify(config),
  });
};

// ── Interactions ──────────────────────────────────────────────────────────────

export const apiGetInteractions = async () => {
  return request('/api/interactions');
};

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
  answers: any;
  total_score: number;
  total_percentage: number;
  level: string;
  created_at: string;
  updated_at: string;
}

