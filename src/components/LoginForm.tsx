import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowRight01Icon, ArrowLeft01Icon, UserCircleIcon, Mail01Icon, SmartPhone01Icon, Calendar01Icon, Location01Icon, CheckmarkBadge01Icon, LockIcon, SecurityCheckIcon, Briefcase01Icon, UserGroup03Icon } from 'hugeicons-react';
import { toast } from 'sonner';
import { STATES } from '@/types/financial';
import { Checkbox } from '@/components/ui/checkbox';
import { apiCheckUser } from '@/lib/api';
import { isValidFullName, isValidEmail, isValidBrazilianPhone } from '@/lib/validators';
const STEPS = [
  { id: 'email', label: 'Qual é o seu melhor e-mail?', subtitle: 'Usaremos para identificar seu histórico', icon: Mail01Icon },
  { id: 'name', label: 'Qual é o seu nome completo?', subtitle: 'Nos conte como devemos te chamar', icon: UserCircleIcon },
  { id: 'gender', label: 'Qual é o seu sexo?', subtitle: 'Informação importante para o diagnóstico', icon: UserGroup03Icon },
  { id: 'region', label: 'Em qual estado você mora?', subtitle: 'Isso ajuda a personalizar seu diagnóstico', icon: Location01Icon },
  { id: 'birthDate', label: 'Qual é a sua data de nascimento?', subtitle: 'Para analisar seu perfil financeiro', icon: Calendar01Icon },
  { id: 'profession', label: 'Qual é a sua profissão?', subtitle: 'Entender sua área nos ajuda a orientar melhor', icon: Briefcase01Icon },
  { id: 'whatsapp', label: 'Qual é o seu WhatsApp?', subtitle: 'Para enviarmos seu diagnóstico completo', icon: SmartPhone01Icon },
  { id: 'lgpd', label: 'Consentimento de uso de dados', subtitle: 'Privacidade é importante para nós', icon: SecurityCheckIcon },
] as const;

type Mode = 'register' | 'login';

export const LoginForm = ({ forceLogin = false, onBack }: { forceLogin?: boolean, onBack?: () => void }) => {
  const [mode, setMode] = useState<Mode>(forceLogin ? 'login' : 'register');
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [region, setRegion] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [profession, setProfession] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp, signIn } = useAuth();

  // Login mode fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const activeSteps = STEPS;

  const formatWhatsapp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(formatWhatsapp(e.target.value));
  };

  const getCurrentValue = () => {
    switch (activeSteps[currentStep]?.id) {
      case 'name': return name;
      case 'email': return email;
      case 'gender': return gender;
      case 'region': return region;
      case 'birthDate': return birthDate;
      case 'profession': return profession;
      case 'whatsapp': return whatsapp;
      case 'lgpd': return lgpdConsent ? 'true' : '';
      default: return '';
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (activeSteps[currentStep]?.id) {
      case 'name': {
        const nameVal = isValidFullName(name);
        if (!nameVal.valid) { toast.error(nameVal.error); return false; }
        return true;
      }
      case 'email': {
        const emailVal = isValidEmail(email);
        if (!emailVal.valid) { toast.error(emailVal.error); return false; }
        return true;
      }
      case 'gender':
        if (!gender) { toast.error('Por favor, selecione seu sexo'); return false; }
        return true;
      case 'region':
        if (!region) { toast.error('Por favor, selecione sua região'); return false; }
        return true;
      case 'birthDate':
        if (!birthDate) { toast.error('Por favor, insira sua data de nascimento'); return false; }
        return true;
      case 'profession':
        if (!profession.trim()) { toast.error('Por favor, insira sua profissão'); return false; }
        return true;
      case 'whatsapp': {
        const phoneVal = isValidBrazilianPhone(whatsapp);
        if (!phoneVal.valid) { toast.error(phoneVal.error); return false; }
        return true;
      }
      case 'lgpd':
        if (!lgpdConsent) { toast.error('Você precisa concordar com a política de uso de dados para continuar'); return false; }
        return true;
      default: return true;
    }
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    if (activeSteps[currentStep]?.id === 'email') {
      const cleanEmail = email.trim().toLowerCase();
      setIsSubmitting(true);
      try {
        // 1. Tentar fazer o login silencioso para ver se já tem conta
        const { error: signInError } = await signIn(cleanEmail, 'TemporaryPassword123!');
        
        if (!signInError) {
          // Login funcionou! Usuário já estava cadastrado.
          toast.success('Bem-vindo de volta! Retomando seu teste...');
          return; // AuthContext vai atualizar e levar para o Dashboard/Quiz
        }

        // 2. Se falhou (ex: é admin ou usuário legado migrado), consulta a API
        const { exists, user } = await apiCheckUser(cleanEmail);
        
        if (exists) {
          // Tenta recriar o usuário no auth (para usuários legados da migração que só existem no profiles)
          const { error: signUpError } = await signUp(cleanEmail, {
            name: user?.name || '',
            gender: user?.gender || '',
            region: user?.region || '',
            birthDate: user?.birth_date || '',
            whatsapp: user?.whatsapp || '',
            profession: user?.profession || '',
          });

          // Se criou com sucesso, loga ele silenciosamente
          if (!signUpError) {
            const { error: retryLoginError } = await signIn(cleanEmail, 'TemporaryPassword123!');
            if (!retryLoginError) {
              toast.success('Bem-vindo de volta! Retomando seu teste...');
              return;
            }
          }

          // Se já existe no auth.users (signUpError com 'already registered') ou falhou o login
          // Então é um Admin ou alguém que alterou a senha.
          const existingName = user?.name || cleanEmail.split('@')[0];
          setMode('login');
          setLoginEmail(cleanEmail);
          toast.info(`Olá ${existingName.split(' ')[0]}, sua conta já existe. Por favor, digite sua senha.`);
          return;
        }
        
        // Novo usuário, prossegue com o cadastro
        setCurrentStep(currentStep + 1);
      } catch (err) {
        console.error('Check user failed:', err);
        setCurrentStep(currentStep + 1);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (currentStep === activeSteps.length - 1) {
      handleRegister();
    } else {
      setIsTransitioning(true);
      setTimeout(() => { setCurrentStep(prev => prev + 1); setIsTransitioning(false); }, 200);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setIsTransitioning(true);
      setTimeout(() => { setCurrentStep(prev => prev - 1); setIsTransitioning(false); }, 200);
    }
  };

  const handleRegister = async () => {
    setIsSubmitting(true);
    const { error } = await signUp(email, {
      name,
      gender,
      region,
      birthDate,
      whatsapp,
      profession,
    });
    setIsSubmitting(false);
    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        toast.info('Este e-mail já está cadastrado. Por favor, faça login.');
        setMode('login');
        setLoginEmail(email);
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Bem-vindo ao Raio X Ex Devedor!');
    }
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginEmail.includes('@')) { toast.error('Insira um e-mail válido'); return; }
    if (!loginPassword) { toast.error('Insira sua senha'); return; }
    setIsSubmitting(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsSubmitting(false);
    if (error) {
      toast.error('E-mail ou senha incorretos');
    } else {
      toast.success('Bem-vindo de volta!');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (mode === 'login') handleLogin();
      else handleNext();
    }
  };

  // ── Admin Login ─────────────────────────────────────────────────
  if (mode === 'login') {
    return (
      <div className="min-h-screen flex flex-col bg-background transition-colors duration-500">
        <header className="relative z-10 p-4 sm:p-6 flex justify-between items-center bg-card/30 backdrop-blur-sm border-b border-border/10">
          <Logo size="sm" />
          <ThemeToggle />
        </header>

        <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 pb-16">
          <div className="w-full max-w-md">
            <div className="card-hooked p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-2xl bg-primary/10">
                  <LockIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Área administrativa</h1>
                  <p className="text-sm text-muted-foreground">Acesso restrito para administradores</p>
                </div>
              </div>

              <div className="space-y-5 mb-8">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground/70 ml-1">E-mail</label>
                  <Input type="email" placeholder="admin@exemplo.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} onKeyDown={handleKeyDown}
                    className="h-14 px-5 text-base bg-muted/20 border-0 focus-visible:ring-1 focus-visible:ring-accent focus:bg-muted/30 rounded-full font-medium placeholder:text-muted-foreground/40 transition-colors" autoFocus />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground/70 ml-1">Senha</label>
                  <Input type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} onKeyDown={handleKeyDown}
                    className="h-14 px-5 text-base bg-muted/20 border-0 focus-visible:ring-1 focus-visible:ring-accent focus:bg-muted/30 rounded-full font-medium placeholder:text-muted-foreground/40 transition-colors" />
                </div>
              </div>

              <Button onClick={handleLogin} disabled={isSubmitting}
                className="w-full h-14 text-lg font-bold btn-accent rounded-full disabled:opacity-50 shadow-lg shadow-accent/20">
                {isSubmitting ? 'Entrando...' : 'Acessar Painel'}
              </Button>

              {onBack ? (
                <button onClick={onBack}
                  className="w-full mt-6 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                  ← Voltar para o Início
                </button>
              ) : !forceLogin ? (
                <button onClick={() => setMode('register')}
                  className="w-full mt-6 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                  ← Voltar para o Diagnóstico
                </button>
              ) : (
                <a href="/"
                  className="block text-center w-full mt-6 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                  ← Voltar para o Início
                </a>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Registration Wizard ─────────────────────────────────────────
  const CurrentIcon = activeSteps[currentStep]?.icon || UserCircleIcon;
  const progress = ((currentStep + 1) / activeSteps.length) * 100;
  const currentStepId = activeSteps[currentStep]?.id;
  const currentLabel = activeSteps[currentStep]?.label || '';
  const currentSubtitle = activeSteps[currentStep]?.subtitle || '';

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-500 relative overflow-hidden">
      {/* Decorative elements - softer in light mode */}
      <div className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] bg-primary opacity-[0.03] dark:opacity-[0.05] rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent opacity-[0.03] dark:opacity-[0.05] rounded-full blur-[100px]" />

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-muted/30 z-50">
        <div className="h-full bg-gradient-to-r from-accent to-secondary transition-all duration-700 ease-out rounded-r-full shadow-sm"
          style={{ width: `${progress}%` }} />
      </div>

      <header className="relative z-10 p-4 sm:p-6 flex justify-between items-center bg-card/30 backdrop-blur-sm border-b border-border/10">
        <Logo size="sm" />
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 pb-20 sm:pb-24">
        <div className={`w-full max-w-xl transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-4 scale-[0.99]' : 'opacity-100 translate-y-0 scale-100'}`}>
          {/* Question */}
          <div className="text-center mb-10">
            <div className="inline-flex p-4 rounded-full bg-accent/10 mb-6">
              <CurrentIcon className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-2 tracking-tight">
              {currentLabel}
            </h1>
            <p className="text-sm font-medium text-muted-foreground">{currentSubtitle}</p>
          </div>

          {/* Input */}
          <div className="mb-10 px-4">
            {currentStepId === 'name' && (
              <Input type="text" placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={handleKeyDown}
                className="h-14 w-full text-center text-lg bg-muted/20 border-0 focus-visible:ring-1 focus-visible:ring-accent focus:bg-muted/30 rounded-full font-medium placeholder:text-muted-foreground/40 transition-colors" autoFocus />
            )}
            {currentStepId === 'email' && (
              <Input type="email" placeholder="seuemail@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown}
                className="h-14 w-full text-center text-lg bg-muted/20 border-0 focus-visible:ring-1 focus-visible:ring-accent focus:bg-muted/30 rounded-full font-medium placeholder:text-muted-foreground/40 transition-colors" autoFocus />
            )}

            {currentStepId === 'gender' && (
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="h-14 w-full text-center text-lg bg-muted/20 border-0 focus:ring-1 focus:ring-accent rounded-full font-medium transition-colors justify-center [&>span]:text-center [&>span]:w-full">
                  <SelectValue placeholder="Selecione seu sexo" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="Masculino" className="text-base py-3 rounded-xl cursor-pointer">Masculino</SelectItem>
                  <SelectItem value="Feminino" className="text-base py-3 rounded-xl cursor-pointer">Feminino</SelectItem>
                  <SelectItem value="Outro" className="text-base py-3 rounded-xl cursor-pointer">Outro</SelectItem>
                </SelectContent>
              </Select>
            )}

            {currentStepId === 'region' && (
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="h-14 w-full text-center text-lg bg-muted/20 border-0 focus:ring-1 focus:ring-accent rounded-full font-medium transition-colors justify-center [&>span]:text-center [&>span]:w-full">
                  <SelectValue placeholder="Selecione seu estado" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {STATES.map((r) => (
                    <SelectItem key={r} value={r} className="text-base py-3 rounded-xl cursor-pointer">{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {currentStepId === 'birthDate' && (
              <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} onKeyDown={handleKeyDown}
                className="h-14 w-full text-center text-lg bg-muted/20 border-0 focus-visible:ring-1 focus-visible:ring-accent focus:bg-muted/30 rounded-full font-medium text-foreground transition-colors" autoFocus />
            )}
            {currentStepId === 'profession' && (
              <Input type="text" placeholder="Sua ocupação principal" value={profession} onChange={(e) => setProfession(e.target.value)} onKeyDown={handleKeyDown}
                className="h-14 w-full text-center text-lg bg-muted/20 border-0 focus-visible:ring-1 focus-visible:ring-accent focus:bg-muted/30 rounded-full font-medium placeholder:text-muted-foreground/40 transition-colors" autoFocus />
            )}
            {currentStepId === 'whatsapp' && (
              <Input type="tel" placeholder="(00) 00000-0000" value={whatsapp} onChange={handleWhatsappChange} onKeyDown={handleKeyDown}
                className="h-14 w-full text-center text-lg bg-muted/20 border-0 focus-visible:ring-1 focus-visible:ring-accent focus:bg-muted/30 rounded-full font-medium placeholder:text-muted-foreground/40 transition-colors" autoFocus />
            )}
            {currentStepId === 'lgpd' && (
              <div className="space-y-5">
                <div className="p-5 rounded-3xl bg-muted/30 border border-border text-foreground/80 text-sm leading-relaxed max-h-48 overflow-y-auto scrollbar-thin">
                  <p className="mb-3 font-bold text-foreground">Aviso de Privacidade (LGPD):</p>
                  <p className="mb-3">Para realizar seu diagnóstico, coletamos:</p>
                  <ul className="list-disc list-inside space-y-1.5 mb-3 text-muted-foreground font-medium">
                    <li>Nome, E-mail e WhatsApp</li>
                    <li>Localização e Profissão</li>
                    <li>Dados de perfil comportamental financeiro</li>
                  </ul>
                  <p className="text-muted-foreground">Seus dados são criptografados e usados apenas para gerar este relatório personalizado. Você pode solicitar a exclusão a qualquer momento.</p>
                </div>
                <div className="flex items-start gap-4 p-2">
                  <Checkbox id="lgpd" checked={lgpdConsent} onCheckedChange={(checked) => setLgpdConsent(checked === true)}
                    className="mt-1 h-6 w-6 rounded-lg border-muted-foreground/30 data-[state=checked]:bg-accent data-[state=checked]:border-accent" />
                  <label htmlFor="lgpd" className="text-foreground/90 text-sm font-bold cursor-pointer leading-tight py-0.5">
                    Estou ciente e concordo com o processamento dos meus dados para fins de diagnóstico financeiro.
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 px-4">
            <Button type="button" onClick={handleNext} disabled={!getCurrentValue() || isSubmitting}
              className="h-14 px-10 text-lg font-bold btn-accent rounded-full transition-all disabled:opacity-40 w-full sm:flex-1 gap-2 order-1 sm:order-2 shadow-lg shadow-accent/20">
              {currentStep === activeSteps.length - 1 ? (
                isSubmitting ? 'Finalizando...' : <><CheckmarkBadge01Icon className="h-5 w-5 stroke-[3]" />Gerar Diagnóstico</>
              ) : (
                <>Continuar<ArrowRight01Icon className="h-5 w-5 stroke-[3]" /></>
              )}
            </Button>
            {currentStep > 0 ? (
              <Button type="button" variant="ghost" onClick={handleBack}
                className="h-14 px-6 text-muted-foreground font-bold hover:text-foreground hover:bg-muted/50 rounded-full gap-2 w-full sm:w-auto order-2 sm:order-1 transition-all">
                <ArrowLeft01Icon className="h-4 w-4" />
                Voltar
              </Button>
            ) : onBack ? (
              <Button type="button" variant="ghost" onClick={onBack}
                className="h-14 px-6 text-muted-foreground font-bold hover:text-foreground hover:bg-muted/50 rounded-full gap-2 w-full sm:w-auto order-2 sm:order-1 transition-all">
                <ArrowLeft01Icon className="h-4 w-4" />
                Início
              </Button>
            ) : null}
          </div>

          {/* Footer hint */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold text-muted-foreground/40 hidden sm:block uppercase tracking-widest">
                Atalho: <kbd className="px-2 py-1 rounded-lg bg-muted text-muted-foreground text-[10px]">ENTER</kbd>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Step dots */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 flex justify-center gap-3 bg-gradient-to-t from-background to-transparent pointer-events-none">
        {activeSteps.map((_, index) => (
          <div key={index} className={`rounded-full transition-all duration-700 ${
            index === currentStep ? 'w-10 h-2 bg-accent shadow-sm' : index < currentStep ? 'w-2 h-2 bg-accent/40' : 'w-2 h-2 bg-muted'
          }`} />
        ))}
      </footer>
    </div>
  );
};
