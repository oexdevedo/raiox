import { supabase } from './supabase';

// Helper to handle Supabase errors
const handleResponse = <T>(response: { data: T | null; error: any }) => {
  if (response.error) throw new Error(response.error.message);
  return response.data as T;
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
  // Note: Registration in this flow is handled via Auth.signUp
  // The profile is created automatically by the DB trigger defined in migrations
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: 'TemporaryPassword123!', // You might want to let the user set this
    options: {
      data: {
        name: payload.name,
        region: payload.region,
        gender: payload.gender,
        birthDate: payload.birth_date,
        whatsapp: payload.whatsapp,
        profession: payload.profession,
      }
    }
  });

  if (error) throw error;
  
  // Return a mapped user object for compatibility
  const user: ApiUser = {
    id: data.user?.id as any,
    name: payload.name,
    email: payload.email,
    gender: payload.gender || '',
    region: payload.region || '',
    birth_date: payload.birth_date || '',
    whatsapp: payload.whatsapp || '',
    profession: payload.profession || '',
    contact_status: 'Pendente',
    last_contact_at: null,
    created_at: new Date().toISOString(),
  };

  return { success: true, user };
};

export const apiCheckUser = async (email: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  return { exists: !!data, user: data as ApiUser | null };
};

export const apiLogin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Check if user has admin role in user_roles table
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', data.user.id)
    .eq('role', 'admin')
    .single();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', data.user.id)
    .single();

  return { 
    success: true, 
    isAdmin: !!roleData, 
    user: { ...profile, id: data.user.id } as ApiUser 
  };
};

export const apiGetUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  return handleResponse<ApiUser[]>({ data, error });
};

export const apiUpdateUser = async (email: string, updates: Partial<ApiUser>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('email', email)
    .select()
    .single();
  return handleResponse<ApiUser>({ data, error });
};

export const apiDeleteUser = async (email: string) => {
  // Delete from profiles (auth user deletion usually needs admin client or manual action)
  const { error } = await supabase.from('profiles').delete().eq('email', email);
  if (error) throw error;
};

// ── Admins ────────────────────────────────────────────────────────────────────

export const apiGetAdmins = async () => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('id, profiles(email), created_at')
    .eq('role', 'admin');
  
  return (data || []).map(item => ({
    id: item.id,
    email: (item.profiles as any)?.email,
    created_at: item.created_at
  })) as any;
};

export const apiCreateAdmin = async (email: string, password?: string) => {
  // First, find the user ID by email in the profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('email', email)
    .single();

  if (profileError || !profile) {
    throw new Error('Usuário não encontrado. Peça para o novo admin se cadastrar no site primeiro.');
  }

  // Add the admin role to this user
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({ user_id: profile.user_id, role: 'admin' });

  if (roleError) {
    if (roleError.code === '23505') throw new Error('Este usuário já é um administrador.');
    throw roleError;
  }

  return { success: true };
};

export const apiDeleteAdmin = async (email: string) => {
  const { data: profile } = await supabase.from('profiles').select('user_id').eq('email', email).single();
  if (profile) {
    await supabase.from('user_roles').delete().eq('user_id', profile.user_id).eq('role', 'admin');
  }
};

// ── Incomes ───────────────────────────────────────────────────────────────────

export const apiGetIncomes = async (email: string) => {
  const { data: profile } = await supabase.from('profiles').select('user_id').eq('email', email).single();
  if (!profile) return [];
  
  const { data, error } = await supabase
    .from('incomes')
    .select('*')
    .eq('user_id', profile.user_id)
    .order('created_at', { ascending: false });
  return handleResponse<ApiIncome[]>({ data, error });
};

export const apiAddIncome = async (user_email: string, description: string, amount: number) => {
  const { data: profile } = await supabase.from('profiles').select('user_id').eq('email', user_email).single();
  if (!profile) throw new Error('User not found');

  const { data, error } = await supabase
    .from('incomes')
    .insert({ user_id: profile.user_id, description, amount })
    .select()
    .single();
  
  return { success: true, income: handleResponse<ApiIncome>({ data, error }) };
};

export const apiDeleteIncome = async (id: string) => {
  const { error } = await supabase.from('incomes').delete().eq('id', id);
  if (error) throw error;
};

// ── Expenses ──────────────────────────────────────────────────────────────────

export const apiGetExpenses = async (email: string) => {
  const { data: profile } = await supabase.from('profiles').select('user_id').eq('email', email).single();
  if (!profile) return [];

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', profile.user_id)
    .order('created_at', { ascending: false });
  return handleResponse<ApiExpense[]>({ data, error });
};

export const apiAddExpense = async (user_email: string, description: string, amount: number, category: string) => {
  const { data: profile } = await supabase.from('profiles').select('user_id').eq('email', user_email).single();
  if (!profile) throw new Error('User not found');

  const { data, error } = await supabase
    .from('expenses')
    .insert({ user_id: profile.user_id, description, amount, category })
    .select()
    .single();
  
  return { success: true, expense: handleResponse<ApiExpense>({ data, error }) };
};

export const apiDeleteExpense = async (id: string) => {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
};

// ── Behavioral ────────────────────────────────────────────────────────────────

export const apiGetBehavioral = async (email: string) => {
  const { data: profile } = await supabase.from('profiles').select('user_id').eq('email', email).single();
  if (!profile) return null;

  const { data, error } = await supabase
    .from('behavioral_answers')
    .select('*')
    .eq('user_id', profile.user_id)
    .single();
  return data as ApiBehavioral | null;
};

export const apiSaveBehavioral = async (payload: {
  user_email: string;
  answers: Record<number, number>;
  total_score: number;
  total_percentage: number;
  level: string;
}) => {
  const { data: profile } = await supabase.from('profiles').select('user_id').eq('email', payload.user_email).single();
  if (!profile) throw new Error('User not found');

  const { error } = await supabase
    .from('behavioral_answers')
    .upsert({
      user_id: profile.user_id,
      answers: payload.answers,
      total_score: payload.total_score,
      total_percentage: payload.total_percentage,
      level: payload.level,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  
  if (error) throw error;
  return { success: true };
};

// ── Custom Buttons ────────────────────────────────────────────────────────────

export const apiGetCustomButtons = async () => {
  const { data, error } = await supabase
    .from('custom_buttons')
    .select('config')
    .eq('id', 1)
    .single();
  return (data?.config || {}) as Record<string, unknown>;
};

export const apiSaveCustomButtons = async (config: Record<string, unknown>) => {
  const { error } = await supabase
    .from('custom_buttons')
    .upsert({ id: 1, config }, { onConflict: 'id' });
  if (error) throw error;
};

// ── Interactions ──────────────────────────────────────────────────────────────

export const apiGetInteractions = async () => {
  const { data, error } = await supabase
    .from('interactions')
    .select('*, profiles(email)')
    .order('created_at', { ascending: false });
  
  return (data || []).map(item => ({
    ...item,
    user_email: (item.profiles as any)?.email
  }));
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ApiUser {
  id: string;
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
  id: string | number;
  email: string;
  created_at: string;
}

export interface ApiIncome {
  id: string | number;
  user_id: string;
  description: string;
  amount: number;
  created_at: string;
}

export interface ApiExpense {
  id: string | number;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  created_at: string;
}

export interface ApiBehavioral {
  id: string | number;
  user_id: string;
  answers: any;
  total_score: number;
  total_percentage: number;
  level: string;
  created_at: string;
  updated_at: string;
}
