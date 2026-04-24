import { FinancialAnalysis } from '@/types/financial';
import { ArrowUpRight01Icon as TrendingUp, ArrowDownRight01Icon as TrendingDown, EqualSignIcon as Equal, CheckmarkCircle02Icon as CheckCircle2, CancelCircleIcon as XCircle, Alert01Icon as AlertTriangle } from 'hugeicons-react';

interface FinancialStatusProps {
  analysis: FinancialAnalysis;
}

export const FinancialStatus = ({ analysis }: FinancialStatusProps) => {
  const { status, totalIncome, totalExpenses, balance } = analysis;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'positive':
        return {
          icon: CheckCircle2,
          gradient: 'from-emerald-500/10 to-emerald-500/5',
          borderColor: 'border-emerald-500/20',
          iconBg: 'bg-emerald-500/15',
          iconColor: 'text-emerald-600',
          title: 'Você está economizando! 🎉',
          description: 'Seus gastos estão abaixo das suas receitas. Continue assim!',
        };
      case 'negative':
        return {
          icon: XCircle,
          gradient: 'from-red-500/10 to-red-500/5',
          borderColor: 'border-red-500/20',
          iconBg: 'bg-red-500/15',
          iconColor: 'text-red-600',
          title: 'Atenção: Gastos acima da receita ⚠️',
          description: 'Você está gastando mais do que ganha. Vamos revisar suas despesas.',
        };
      default:
        return {
          icon: AlertTriangle,
          gradient: 'from-[#DFA83F]/10 to-[#FCCF86]/5',
          borderColor: 'border-[#DFA83F]/20',
          iconBg: 'bg-[#DFA83F]/15',
          iconColor: 'text-[#DFA83F]',
          title: 'Equilibrado',
          description: 'Seus gastos são iguais às receitas. Tente economizar mais!',
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <div className={`card-hooked overflow-hidden animate-fade-in border ${config.borderColor}`}>
      <div className={`bg-gradient-to-r ${config.gradient} p-5 sm:p-8`}>
        <div className="flex items-start gap-5">
          <div className={`p-4 rounded-3xl ${config.iconBg} shadow-sm shrink-0`}>
            <StatusIcon className={`h-8 w-8 ${config.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-xl font-black text-foreground mb-1 tracking-tight">{config.title}</h3>
            <p className="text-sm sm:text-base font-medium text-muted-foreground">{config.description}</p>
          </div>
        </div>

        {/* Financial summary cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 sm:mt-8">
          <div className="bg-card rounded-2xl p-2 sm:p-5 text-center shadow-sm border border-border/40 hover-lift">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
              <div className="hidden sm:block p-1.5 rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest sm:tracking-[0.2em] truncate">Receitas</p>
            </div>
            <p className="text-sm sm:text-xl font-black text-emerald-600 tabular-nums tracking-tighter sm:tracking-tight truncate">{formatCurrency(totalIncome)}</p>
          </div>
          
          <div className="bg-card rounded-2xl p-2 sm:p-5 text-center shadow-sm border border-border/40 hover-lift">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
              <div className="hidden sm:block p-1.5 rounded-lg bg-red-500/10">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest sm:tracking-[0.2em] truncate">Despesas</p>
            </div>
            <p className="text-sm sm:text-xl font-black text-red-600 tabular-nums tracking-tighter sm:tracking-tight truncate">{formatCurrency(totalExpenses)}</p>
          </div>
          
          <div className="bg-card rounded-2xl p-2 sm:p-5 text-center shadow-sm border border-border/40 hover-lift">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
              <div className="hidden sm:block p-1.5 rounded-lg bg-primary/10">
                <Equal className="h-4 w-4 text-primary" />
              </div>
              <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest sm:tracking-[0.2em] truncate">Saldo</p>
            </div>
            <p className={`text-sm sm:text-xl font-black tabular-nums tracking-tighter sm:tracking-tight truncate ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
