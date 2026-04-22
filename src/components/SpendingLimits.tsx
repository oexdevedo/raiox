import { FinancialAnalysis } from '@/types/financial';
import { Clock, CalendarDays, CalendarRange, Wallet } from 'lucide-react';

interface SpendingLimitsProps {
  analysis: FinancialAnalysis;
}

export const SpendingLimits = ({ analysis }: SpendingLimitsProps) => {
  const { dailyLimit, weeklyLimit, monthlyLimit, daysRemaining, balance } = analysis;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const limits = [
    {
      label: 'Gasto por dia',
      value: dailyLimit,
      icon: Clock,
      description: 'Ideal para manter o controle diário',
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
    },
    {
      label: 'Gasto por semana',
      value: weeklyLimit,
      icon: CalendarDays,
      description: 'Planejamento para os próximos 7 dias',
      iconBg: 'bg-secondary/20',
      iconColor: 'text-accent',
    },
    {
      label: 'Até o fim do mês',
      value: monthlyLimit,
      icon: CalendarRange,
      description: `Restam ${daysRemaining} dias de orçamento`,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
  ];

  return (
    <div className="card-hooked animate-fade-in group h-full">
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-5 mb-8">
          <div className="p-4 rounded-3xl bg-accent/15 border border-accent/20 shadow-sm shrink-0">
            <Wallet className="h-7 w-7 text-accent" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-foreground tracking-tight">Onde está o limite?</h3>
            <p className="text-base font-medium text-muted-foreground">Analise quanto você ainda pode gastar com segurança.</p>
          </div>
        </div>

        {balance <= 0 ? (
          <div className="text-center py-10 px-6 rounded-3xl bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10">
            <p className="text-red-600 dark:text-red-400 text-lg font-black tracking-tight mb-2 uppercase">
              Orçamento Esgotado
            </p>
            <p className="text-red-500/70 dark:text-red-400/60 font-medium text-sm max-w-xs mx-auto">
              Você já atingiu o limite planejado para este mês. Evite novas despesas variáveis.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {limits.map((limit) => {
              const Icon = limit.icon;
              return (
                <div
                  key={limit.label}
                  className="flex items-center gap-5 p-5 sm:p-6 rounded-3xl bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-border/40 transition-all duration-300 hover-lift"
                >
                  <div className={`p-4 rounded-2xl ${limit.iconBg} shrink-0 shadow-sm`}>
                    <Icon className={`h-6 w-6 ${limit.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{limit.label}</p>
                    <p className="text-2xl font-black text-foreground tabular-nums tracking-tight">{formatCurrency(limit.value)}</p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-bold text-muted-foreground/60 leading-tight max-w-[120px]">
                      {limit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
