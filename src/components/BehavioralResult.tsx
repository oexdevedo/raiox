import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BrainIcon as Brain, 
  ArrowLeft01Icon as ArrowLeft, 
  ArrowUpRight01Icon as TrendingUp, 
  ArrowDownRight01Icon as TrendingDown, 
  MinusSignIcon as Minus 
} from 'hugeicons-react';
import { FinancialAnalysis } from '@/types/financial';
import {
  BehavioralResult as BehavioralResultType,
  sections,
  sectionConfig,
  SectionName,
} from '@/types/behavioral';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

interface BehavioralResultProps {
  result: BehavioralResultType;
  analysis: FinancialAnalysis;
  onBack: () => void;
}

export const BehavioralResultView = ({ result, analysis, onBack }: BehavioralResultProps) => {
  const radarData = sections.map((s) => ({
    section: s,
    score: result.sectionScores[s].percentage,
    fullMark: 100,
  }));

  const getFinancialIcon = () => {
    if (analysis.status === 'positive') return <TrendingUp className="h-5 w-5 text-success" />;
    if (analysis.status === 'negative') return <TrendingDown className="h-5 w-5 text-destructive" />;
    return <Minus className="h-5 w-5 text-warning" />;
  };

  const getFinancialLabel = () => {
    if (analysis.status === 'positive') return 'Saudável';
    if (analysis.status === 'negative') return 'Crítico';
    return 'Equilibrado';
  };

  const getFinancialColor = () => {
    if (analysis.status === 'positive') return 'text-success';
    if (analysis.status === 'negative') return 'text-destructive';
    return 'text-warning';
  };

  const getLevelStyles = () => {
    switch (result.level) {
      case 'Excelente': return { bg: 'bg-success/10 border-success/30', color: 'text-success' };
      case 'Bom': return { bg: 'bg-accent/10 border-accent/30', color: 'text-accent' };
      case 'Regular': return { bg: 'bg-warning/10 border-warning/30', color: 'text-warning' };
      default: return { bg: 'bg-destructive/10 border-destructive/30', color: 'text-destructive' };
    }
  };

  const levelStyles = getLevelStyles();

  const getSectionFeedback = (section: SectionName, pct: number): string => {
    const feedbacks: Record<SectionName, Record<string, string>> = {
      Passado: {
        high: "Você tem boa consciência sobre sua história financeira e aprendeu com o passado.",
        mid: "Ainda há padrões do passado que podem estar influenciando suas decisões.",
        low: "Refletir sobre sua história financeira pode revelar padrões importantes.",
      },
      Presente: {
        high: "Seus hábitos financeiros atuais são sólidos. Continue assim!",
        mid: "Você tem bons hábitos, mas há espaço para melhorar o controle do dia a dia.",
        low: "Organizar seus gastos e hábitos presentes é prioridade.",
      },
      Futuro: {
        high: "Você tem visão clara do futuro e investe nele ativamente.",
        mid: "Você pensa no futuro, mas precisa de mais ação concreta.",
        low: "Definir metas e investir no futuro trará mais segurança.",
      },
      Revolução: {
        high: "Você está aplicando os princípios de transformação financeira!",
        mid: "Você está no caminho, mas pode acelerar a revolução financeira.",
        low: "Comece com pequenas mudanças para revolucionar suas finanças.",
      },
    };
    const key = pct >= 75 ? 'high' : pct >= 50 ? 'mid' : 'low';
    return feedbacks[section][key];
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-10">
        
        {/* The Reward Reveal */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-card to-muted/20 border border-border/10 shadow-2xl p-8 text-center animate-in zoom-in-95 duration-700">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-accent opacity-[0.08] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-40 h-40 bg-primary opacity-[0.08] rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-accent/10 mb-6 shadow-inner border border-accent/10">
              <Brain className="h-10 w-10 text-accent animate-pulse" />
            </div>
            
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-3">Sua Eficiência Financeira</p>
            
            <div className="text-7xl font-black text-foreground tracking-tighter mb-4 flex items-start justify-center">
              {result.totalPercentage}<span className="text-3xl text-accent mt-2">%</span>
            </div>
            
            <div className={`inline-flex items-center px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest ${levelStyles.bg} ${levelStyles.color} border mb-6 shadow-sm`}>
              Nível: {result.level}
            </div>
            
            <p className="text-sm font-medium text-muted-foreground max-w-xs mx-auto leading-relaxed">
              O seu modelo de crenças sobre dinheiro revela o quanto você está preparado para a riqueza.
            </p>
          </div>
        </div>

        {/* Radar Chart */}
        <div>
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-1.5 h-6 bg-accent rounded-full"></div>
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Mapeamento Neural</h3>
          </div>
          <div className="p-4 sm:p-6 rounded-[2rem] bg-card border border-border/10 shadow-md">
            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
                  <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="section"
                    tick={{ fontSize: 10, fill: 'hsl(var(--foreground))', fontWeight: 700 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="hsl(var(--accent))"
                    fill="hsl(var(--accent))"
                    fillOpacity={0.25}
                    strokeWidth={3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Section Details */}
        <div>
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-1.5 h-6 bg-primary rounded-full"></div>
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Análise Detalhada</h3>
          </div>
          
          <div className="grid gap-4">
            {sections.map((section) => {
              const s = result.sectionScores[section];
              const cfg = sectionConfig[section];
              return (
                <div key={section} className="p-5 sm:p-6 rounded-[2rem] bg-card border border-border/10 shadow-md hover:shadow-lg transition-all group">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="p-3 rounded-2xl bg-muted/30 text-2xl group-hover:scale-110 group-hover:bg-accent/10 transition-all duration-300">
                      {cfg.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-black text-foreground tracking-tight mb-0.5">{section}</h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Pilar Comportamental</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-accent">{s.percentage}%</span>
                    </div>
                  </div>
                  
                  <div className="relative h-2.5 w-full bg-muted/30 rounded-full overflow-hidden mb-5">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-secondary rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${s.percentage}%` }}
                    />
                  </div>
                  
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed bg-muted/10 p-4 rounded-2xl border border-border/5">
                    {getSectionFeedback(section, s.percentage)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 pb-12">
          <Button onClick={onBack} className="w-full h-16 rounded-[2rem] text-lg font-black bg-accent text-accent-foreground shadow-xl shadow-accent/20 flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] hover:bg-accent/90">
            Continuar para o Raio X
            <ArrowLeft className="h-5 w-5 rotate-180 stroke-[3]" />
          </Button>
        </div>
      </main>
    </div>
  );
};
