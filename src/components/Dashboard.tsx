import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFinancialData } from '@/hooks/useFinancialData';
import { apiGetBehavioral, apiSaveBehavioral } from '@/lib/api';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FinancialStatus } from '@/components/FinancialStatus';
import { SpendingLimits } from '@/components/SpendingLimits';
import { IncomeForm } from '@/components/IncomeForm';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ReportDownload } from '@/components/ReportDownload';
import { BehavioralQuiz } from '@/components/BehavioralQuiz';
import { BehavioralResultView } from '@/components/BehavioralResult';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { 
  LogOut, 
  RefreshCw, 
  Brain, 
  User as UserIcon, 
  ExternalLink, 
  XCircle, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  ArrowRight,
  LineChart,
  ClipboardList,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { BehavioralAnswers, calculateBehavioralResult, BehavioralResult } from '@/types/behavioral';
import { useCustomButtons } from '@/hooks/useCustomButtons';
import { cn } from '@/lib/utils';

type Step = 1 | 2 | 3;

export const Dashboard = () => {
  const { user, profile, logout } = useAuth();
  const { buttons: customButtons, isLoading: loadingButtons } = useCustomButtons();
  const {
    incomes,
    expenses,
    addIncome,
    removeIncome,
    addExpense,
    removeExpense,
    getAnalysis,
    clearAllData,
  } = useFinancialData();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [behavioralResult, setBehavioralResult] = useState<BehavioralResult | null>(null);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);

  const analysis = getAnalysis();

  useEffect(() => {
    if (!user) return;
    setIsLoadingQuiz(true);
    apiGetBehavioral(user.email)
      .then((data) => {
        if (data && data.answers) {
          const answers = typeof data.answers === 'string' ? JSON.parse(data.answers) : data.answers;
          const result = calculateBehavioralResult(answers as BehavioralAnswers);
          setBehavioralResult(result);
          if (incomes.length > 0 || expenses.length > 0) {
            setCurrentStep(3);
          } else {
            setCurrentStep(2);
          }
        } else {
          setCurrentStep(1);
        }
      })
      .catch(() => {
        setCurrentStep(1);
      })
      .finally(() => {
        setIsLoadingQuiz(false);
      });
  }, [user]);

  useEffect(() => {
    if (loadingButtons || hasShownPopup || currentStep !== 3) return;
    
    const status = analysis.status;
    const config = customButtons[status];
    
    if (config?.visible && config?.message && (incomes.length > 0 || expenses.length > 0)) {
      const storageKey = `dismissed_popup_${status}_${user?.email}`;
      const isDismissed = sessionStorage.getItem(storageKey);
      
      if (!isDismissed) {
        setShowStatusPopup(true);
        setHasShownPopup(true);
      }
    }
  }, [analysis.status, customButtons, loadingButtons, incomes.length, expenses.length, user?.email, hasShownPopup, currentStep]);

  const handleDismissPopup = () => {
    setShowStatusPopup(false);
    const storageKey = `dismissed_popup_${analysis.status}_${user?.email}`;
    sessionStorage.setItem(storageKey, 'true');
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Até logo!');
  };

  const handleClear = async () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados financeiros? Isso não pode ser desfeito.')) {
      await clearAllData();
      setCurrentStep(2);
      toast.success('Todos os dados foram removidos.');
    }
  };

  const handleQuizComplete = async (answers: BehavioralAnswers) => {
    const result = calculateBehavioralResult(answers);
    setBehavioralResult(result);
    
    if (user) {
      await apiSaveBehavioral({
        user_email: user.email,
        answers,
        total_score: result.totalScore,
        total_percentage: result.totalPercentage,
        level: result.level,
      });
    }

    toast.success('Perfil Comportamental concluído!');
    setCurrentStep(2);
  };

  const firstName = profile?.name?.split(' ')[0] || 'Usuário';
  const currentStatusConfig = customButtons[analysis.status];

  const steps = [
    { title: 'Perfil', icon: Brain, description: 'Sua Mentalidade' },
    { title: 'Finanças', icon: ClipboardList, description: 'Seus Números' },
    { title: 'Diagnóstico', icon: LineChart, description: 'Seus Resultados' },
  ];

  if (isLoadingQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-10 w-10 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/70 backdrop-blur-md border-b border-border/10">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="sm" showText={false} />
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/30 border border-border/10">
                <UserIcon className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground truncate max-w-[150px]">
                  {firstName}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="h-6 w-px bg-border/40" />
              <Button variant="ghost" size="sm" onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl h-10 px-3 transition-all">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Stepper - Optimized UI */}
      <div className="bg-muted/5 border-b border-border/5">
        <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 max-w-4xl">
          <div className="relative flex justify-between items-center px-2 sm:px-12">
            {/* Progress line */}
            <div className="absolute top-[22px] left-6 sm:left-16 right-6 sm:right-16 h-0.5 bg-border/20 z-0" />
            <div 
              className="absolute top-[22px] left-6 sm:left-16 h-0.5 bg-accent transition-all duration-700 ease-in-out z-0"
              style={{ width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 3rem)` }}
            />

            {steps.map((step, idx) => {
              const Icon = step.icon;
              const stepNum = idx + 1;
              const isActive = currentStep === stepNum;
              const isCompleted = currentStep > stepNum;

              return (
                <div key={idx} className="relative z-10 flex flex-col items-center">
                  <button
                    disabled={stepNum > currentStep && !behavioralResult && stepNum !== 1}
                    onClick={() => (stepNum <= currentStep || (stepNum === 2 && behavioralResult)) && setCurrentStep(stepNum as Step)}
                    className={cn(
                      "h-11 w-11 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
                      isActive ? "bg-accent border-accent text-accent-foreground scale-110 shadow-lg shadow-accent/20" :
                      isCompleted ? "bg-primary border-primary text-primary-foreground" :
                      "bg-card border-border/40 text-muted-foreground"
                    )}
                  >
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </button>
                  <div className="mt-4 text-center">
                    <p className={cn("text-[9px] font-black uppercase tracking-widest mb-0.5", isActive ? "text-accent" : "text-muted-foreground")}>
                      Passo {stepNum}
                    </p>
                    <p className={cn("text-xs font-bold leading-tight", isActive ? "text-foreground" : "text-muted-foreground/50")}>
                      {step.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-6xl">
        {/* STEP 1: BEHAVIORAL QUIZ */}
        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!behavioralResult ? (
              <BehavioralQuiz onComplete={handleQuizComplete} onBack={() => {}} />
            ) : (
              <div className="space-y-8">
                <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
                  <div className="p-4 rounded-3xl bg-accent/10 w-fit mx-auto">
                    <Sparkles className="h-10 w-10 text-accent" />
                  </div>
                  <h2 className="text-3xl font-black text-foreground tracking-tight">Perfil Já Concluído!</h2>
                  <p className="text-lg font-medium text-muted-foreground">
                    Você já realizou o protocolo comportamental. Sua mentalidade: <span className="text-accent font-black">{behavioralResult.level}</span>.
                  </p>
                  <div className="flex justify-center gap-4 pt-4">
                    <Button onClick={() => setBehavioralResult(null)} variant="outline" className="rounded-2xl h-14 px-8 font-bold border-border/40">
                      Refazer Quiz
                    </Button>
                    <Button onClick={() => setCurrentStep(2)} className="btn-accent h-14 px-10 rounded-2xl font-black shadow-lg shadow-accent/20">
                      Ir para Raio X Financeiro
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <BehavioralResultView result={behavioralResult} analysis={analysis} onBack={() => setCurrentStep(2)} />
              </div>
            )}
          </div>
        )}

        {/* STEP 2: FINANCIAL DATA */}
        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-2 tracking-tight">Raio X Financeiro</h2>
                <p className="text-lg font-medium text-muted-foreground">Insira suas receitas e despesas para gerar o diagnóstico.</p>
              </div>
              <Button 
                onClick={() => setCurrentStep(3)} 
                disabled={incomes.length === 0 && expenses.length === 0}
                className="btn-accent h-16 px-10 rounded-2xl font-black text-lg shadow-xl shadow-accent/20 w-full sm:w-auto"
              >
                Gerar Diagnóstico
                <ArrowRight className="ml-3 h-6 w-6 stroke-[3]" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <IncomeForm incomes={incomes} onAdd={addIncome} onRemove={removeIncome} />
              <ExpenseForm expenses={expenses} onAdd={addExpense} onRemove={removeExpense} />
            </div>

            {(incomes.length > 0 || expenses.length > 0) && (
              <div className="pt-12 text-center">
                <Button variant="ghost" onClick={handleClear} className="text-muted-foreground hover:text-destructive gap-2 font-bold uppercase tracking-widest text-[10px]">
                  <RefreshCw className="h-4 w-4" />
                  Limpar todos os dados e recomeçar
                </Button>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: RESULTS & RECOMMENDATIONS - Organized Layout */}
        {currentStep === 3 && (
          <div className="animate-in fade-in zoom-in-95 duration-500 space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-1 tracking-tight">Diagnóstico Final</h2>
                <p className="text-lg font-medium text-muted-foreground">Baseado no seu perfil comportamental e números financeiros.</p>
              </div>
              <Button variant="outline" onClick={() => setCurrentStep(2)} className="rounded-2xl h-11 px-6 font-black border-border/10 gap-2 hover:bg-muted/50 transition-all">
                <ChevronLeft className="h-4 w-4" />
                Editar Dados
              </Button>
            </div>

            {/* Top row: Analysis Status (Full Width) */}
            <div className="w-full">
              <FinancialStatus analysis={analysis} />
            </div>

            {/* Recommendation Box (conditional on admin config) */}
            {currentStatusConfig?.visible && currentStatusConfig?.label && currentStatusConfig?.url && (
              <Card className={cn(
                "border-2 shadow-card animate-fade-in overflow-hidden",
                analysis.status === 'negative' ? 'border-red-500/30 bg-gradient-to-br from-red-500/5 to-red-600/10' :
                analysis.status === 'neutral' ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-amber-600/10' :
                'border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10'
              )}>
                <CardContent className="p-5 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8">
                    {/* Icon */}
                    <div className={cn(
                      "p-4 rounded-2xl shrink-0 shadow-lg",
                      analysis.status === 'negative' ? 'bg-red-500/15 shadow-red-500/10' :
                      analysis.status === 'neutral' ? 'bg-amber-500/15 shadow-amber-500/10' :
                      'bg-emerald-500/15 shadow-emerald-500/10'
                    )}>
                      {analysis.status === 'negative' && <XCircle className="h-7 w-7 text-red-500" />}
                      {analysis.status === 'neutral' && <AlertTriangle className="h-7 w-7 text-amber-500" />}
                      {analysis.status === 'positive' && <CheckCircle2 className="h-7 w-7 text-emerald-500" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className={cn(
                          "h-4 w-4",
                          analysis.status === 'negative' ? 'text-red-500' :
                          analysis.status === 'neutral' ? 'text-amber-500' :
                          'text-emerald-500'
                        )} />
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                          Recomendação para você
                        </h3>
                      </div>
                      {currentStatusConfig.message && (
                        <p className="text-sm sm:text-base font-medium text-foreground/80 leading-relaxed whitespace-pre-wrap">
                          {currentStatusConfig.message}
                        </p>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Button
                      asChild
                      className={cn(
                        "h-14 px-8 rounded-2xl font-black text-white shadow-xl shrink-0 w-full sm:w-auto group transition-all text-base",
                        analysis.status === 'negative' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' :
                        analysis.status === 'neutral' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20' :
                        'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                      )}
                    >
                      <a href={currentStatusConfig.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                        {currentStatusConfig.label}
                        <ExternalLink className="h-5 w-5 stroke-[3] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bottom Row: 3-Column Specific Grid */}
            <div className="grid md:grid-cols-3 gap-6 items-stretch">
              {/* Box 1: Spending Limits */}
              <SpendingLimits analysis={analysis} />

              {/* Box 2: Behavioral Summary */}
              {behavioralResult && (
                <div className="card-hooked p-6 sm:p-8 flex flex-col justify-between group overflow-hidden bg-gradient-to-br from-card to-muted/20">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 rounded-2xl bg-accent/15 border border-accent/20 shadow-sm transition-transform group-hover:scale-110">
                        <Brain className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-foreground tracking-tight">Qual sua mentalidade?</h3>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest leading-loose">Mentalidade: {behavioralResult.level}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="relative h-1 w-full bg-border/20 rounded-full overflow-hidden">
                        <div 
                          className="absolute inset-y-0 left-0 bg-accent transition-all duration-1000 ease-out"
                          style={{ width: `${behavioralResult.totalPercentage}%` }}
                        />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                        Seu score de eficiência é de <span className="text-accent font-black">{behavioralResult.totalPercentage}%</span>. 
                        Isso reflete um perfil <span className="text-foreground font-black">{behavioralResult.level}</span> no trato com o dinheiro.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-border/5">
                    <Button variant="link" onClick={() => setCurrentStep(1)} className="text-accent p-0 h-auto font-black flex items-center gap-2 hover:gap-3 transition-all text-xs uppercase tracking-widest">
                      Ver detalhes psicofinanceiros <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Box 3: Report Download */}
              <ReportDownload
                incomes={incomes}
                expenses={expenses}
                analysis={analysis}
                userEmail={profile?.email || user?.email || ''}
                customButtons={customButtons}
              />
            </div>
          </div>
        )}
      </main>

      {/* Status Popup Dialog */}
      <Dialog open={showStatusPopup} onOpenChange={setShowStatusPopup}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-8 border-none shadow-2xl bg-background outline-none">
          <DialogHeader className="space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted/30 shadow-inner">
              {analysis.status === 'negative' && <XCircle className="h-10 w-10 text-red-500 animate-pulse" />}
              {analysis.status === 'neutral' && <AlertTriangle className="h-10 w-10 text-amber-500 animate-pulse" />}
              {analysis.status === 'positive' && <CheckCircle2 className="h-10 w-10 text-emerald-500 animate-pulse" />}
            </div>
            <div className="space-y-3">
              <DialogTitle className="text-center text-3xl font-black text-foreground tracking-tight">
                Status do seu Raio X
              </DialogTitle>
              <DialogDescription className="text-center text-lg font-medium text-muted-foreground pt-2 leading-relaxed whitespace-pre-wrap">
                {currentStatusConfig?.message}
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 mt-10">
            {currentStatusConfig?.visible && currentStatusConfig?.label && currentStatusConfig?.url && (
              <Button
                asChild
                className={`h-16 text-xl font-black shadow-xl rounded-2xl group transition-all ${
                  analysis.status === 'negative' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' :
                  analysis.status === 'neutral' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20' :
                  'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                } text-white`}
              >
                <a href={currentStatusConfig.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                  {currentStatusConfig.label}
                  <ExternalLink className="h-6 w-6 stroke-[3] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </Button>
            )}
            
            <Button
              variant="ghost"
              onClick={handleDismissPopup}
              className="h-14 rounded-2xl text-muted-foreground font-bold hover:text-foreground hover:bg-muted/50 transition-all uppercase tracking-widest text-xs"
            >
              Agora não, obrigado
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="mt-20 py-12 bg-card/30 border-t border-border/10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6 grayscale opacity-40">
            <Logo size="sm" showText={false} />
            <div className="h-4 w-px bg-foreground" />
            <span className="text-xs font-black uppercase tracking-widest text-foreground">
              Ex Devedor
            </span>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} Raio X Financeiro • Diagnóstico Comportamental Avançado
          </p>
        </div>
      </footer>
    </div>
  );
};
