// Lista negra dos domínios temporários mais comuns
export const DISPOSABLE_EMAILS_BLACKLIST = [
  'mailinator.com',
  'temp-mail.org',
  'tempmail.com',
  '10minutemail.com',
  'yopmail.com',
  'guerrillamail.com',
  'sharklasers.com',
  'trashmail.com',
  'nada.ltd',
  'getairmail.com',
  'throwawaymail.com',
  'tempmailaddress.com',
  'dispostable.com',
  'spamgourmet.com',
  'anonaddy.me',
  'maildrop.cc'
];

/**
 * Valida o nome completo do usuário.
 * Regras:
 * - Deve ter pelo menos nome e sobrenome.
 * - Deve conter apenas letras (incluindo acentos) e espaços.
 * - Cada palavra deve ter pelo menos 2 caracteres.
 * - Nomes não devem ser repetidos (ex: "Teste Teste").
 */
export const isValidFullName = (name: string): { valid: boolean; error?: string } => {
  const cleanName = name.trim().replace(/\s+/g, ' ');
  const parts = cleanName.split(' ');

  if (parts.length < 2) {
    return { valid: false, error: 'Por favor, insira também o seu sobrenome.' };
  }

  // Permite apenas letras acentuadas, espaços e apóstrofos/hífens comuns em nomes
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  if (!nameRegex.test(cleanName)) {
    return { valid: false, error: 'O nome não deve conter números ou símbolos especiais.' };
  }

  for (const part of parts) {
    if (part.length < 2) {
      return { valid: false, error: 'As partes do seu nome devem ter pelo menos 2 letras.' };
    }
  }

  // Verifica repetição óbvia (ex: "Teste Teste")
  if (parts[0].toLowerCase() === parts[1].toLowerCase()) {
    return { valid: false, error: 'Por favor, insira um nome e sobrenome válidos.' };
  }

  // Palavras na lista negra
  const blockedWords = ['teste', 'test', 'anonimo', 'nobody', 'vazio', 'nao', 'tem'];
  for (const part of parts) {
    if (blockedWords.includes(part.toLowerCase())) {
      return { valid: false, error: 'Este nome não parece ser válido.' };
    }
  }

  return { valid: true };
};

/**
 * Valida formato do e-mail e verifica contra provedores descartáveis.
 */
export const isValidEmail = (email: string): { valid: boolean; error?: string } => {
  const cleanEmail = email.trim().toLowerCase();
  
  // Regex básico de e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { valid: false, error: 'Por favor, insira um endereço de e-mail no formato correto.' };
  }

  const localPart = cleanEmail.split('@')[0];
  const domain = cleanEmail.split('@')[1];
  
  if (DISPOSABLE_EMAILS_BLACKLIST.includes(domain)) {
    return { valid: false, error: 'E-mails temporários não são permitidos. Use seu e-mail principal.' };
  }

  // Bloquear prefixos óbvios de teste
  const blockedLocalParts = ['teste', 'test', 'admin', 'contato', 'fake', 'email', '123', '1234', '12345', 'abc', 'asdf', 'qwer', 'qwert'];
  if (blockedLocalParts.includes(localPart)) {
    return { valid: false, error: 'Por favor, insira um endereço de e-mail real e válido.' };
  }

  // Bloquear domínios puramente repetitivos ou compostos apenas por uma letra (ex: aaaa.com, 111.com)
  const domainName = domain.split('.')[0];
  if (/^(\w)\1+$/.test(domainName) || domainName.length < 2) {
    return { valid: false, error: 'O domínio do e-mail não parece ser válido.' };
  }

  return { valid: true };
};

/**
 * Valida telefones celulares brasileiros (WhatsApp).
 * Regras:
 * - Deve ter 11 dígitos numéricos.
 * - DDD deve ser válido (entre 11 e 99, ignorando os inválidos).
 * - O primeiro dígito após o DDD deve ser 9.
 * - Bloqueia sequências falsas (ex: 999999999, 123456789).
 */
export const isValidBrazilianPhone = (phone: string): { valid: boolean; error?: string } => {
  const numbers = phone.replace(/\D/g, '');

  if (numbers.length !== 11) {
    return { valid: false, error: 'O WhatsApp deve ter exatamente 11 números, incluindo o DDD.' };
  }

  const ddd = parseInt(numbers.substring(0, 2), 10);
  const firstDigit = numbers.substring(2, 3);
  const mainNumber = numbers.substring(2);

  // Lista de DDDs inválidos no Brasil
  const invalidDDDs = [20, 25, 26, 29, 30, 36, 39, 40, 50, 56, 57, 58, 59, 60, 70, 72, 76, 78, 80, 90];
  
  if (ddd < 11 || ddd > 99 || invalidDDDs.includes(ddd)) {
    return { valid: false, error: 'O DDD informado não é válido.' };
  }

  if (firstDigit !== '9') {
    return { valid: false, error: 'O número do celular deve começar com o dígito 9.' };
  }

  // Verifica se todos os dígitos pós-DDD são iguais (ex: 999999999, 000000000)
  if (/^(\d)\1+$/.test(mainNumber)) {
    return { valid: false, error: 'Por favor, insira um número de telefone real.' };
  }
  
  // Verifica sequências inválidas
  if (mainNumber === '123456789' || mainNumber === '987654321') {
    return { valid: false, error: 'Por favor, insira um número de telefone real.' };
  }

  return { valid: true };
};
