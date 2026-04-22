export interface Income {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface FinancialData {
  incomes: Income[];
  expenses: Expense[];
}

export interface FinancialAnalysis {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  status: 'positive' | 'negative' | 'neutral';
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  daysRemaining: number;
}

export interface User {
  email: string;
  name: string;
  region: string;
  birthDate: string;
  whatsapp: string;
  profession: string;
  createdAt?: string;
}

export interface StatusButton {
  visible: boolean;
  label: string;
  url: string;
  message: string;
}

export interface CustomButtons {
  negative: StatusButton; // gasta mais que recebe (vermelho)
  neutral: StatusButton;  // gasta igual ao que recebe (amarelo)
  positive: StatusButton; // gasta menos que recebe (verde)
}

// Admin credentials are hashed for security
const hashString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

const ADMIN_EMAIL_HASH = '-q1cat9';
const ADMIN_PASSWORD_HASH = '-ktwlif';

export const isAdminEmail = (email: string): boolean => {
  return hashString(email.toLowerCase()) === ADMIN_EMAIL_HASH;
};

export const isAdminPassword = (password: string): boolean => {
  return hashString(password) === ADMIN_PASSWORD_HASH;
};

export const CUSTOM_BUTTONS_KEY = 'raiox_custom_buttons';

// Legacy compatibility
export interface CustomButton {
  visible: boolean;
  label: string;
  url: string;
}
export const CUSTOM_BUTTON_KEY = 'raiox_custom_button';

export const STATES = [
  'Acre (AC)',
  'Alagoas (AL)',
  'Amapá (AP)',
  'Amazonas (AM)',
  'Bahia (BA)',
  'Ceará (CE)',
  'Distrito Federal (DF)',
  'Espírito Santo (ES)',
  'Goiás (GO)',
  'Maranhão (MA)',
  'Mato Grosso (MT)',
  'Mato Grosso do Sul (MS)',
  'Minas Gerais (MG)',
  'Pará (PA)',
  'Paraíba (PB)',
  'Paraná (PR)',
  'Pernambuco (PE)',
  'Piauí (PI)',
  'Rio de Janeiro (RJ)',
  'Rio Grande do Norte (RN)',
  'Rio Grande do Sul (RS)',
  'Rondônia (RO)',
  'Roraima (RR)',
  'Santa Catarina (SC)',
  'São Paulo (SP)',
  'Sergipe (SE)',
  'Tocantins (TO)',
] as const;

// Keep backward compatibility
export const REGIONS = STATES;
