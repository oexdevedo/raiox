import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
      {/* Header */}
      <header className="sticky top-0 z-50 gradient-primary shadow-lg">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
              <span className="text-sm sm:text-base font-bold text-primary-foreground">
                Resultado do Raio X
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-3xl space-y-4 sm:space-y-6">
        <Card className={`border-2 ${levelStyles.bg} shadow-card animate-fade-in`}>
          <CardContent className="p-4 sm:p-6 text-center">
            <h2 className="text-base sm:text-xl font-bold text-foreground mb-2">
              Sua Mentalidade Financeira
            </h2>
            <div className={`text-4xl sm:text-6xl font-extrabold ${levelStyles.color} mb-1 flex justify-center items-center gap-4`}>
              <Brain className={`h-10 w-10 sm:h-12 sm:w-12 ${levelStyles.color}`} />
              {result.totalPercentage}%
            </div>
            <p className={`text-lg sm:text-2xl font-bold ${levelStyles.color} mt-2`}>
              Perfil {result.level}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              Resultado oficial do seu questionário comportamental.
            </p>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base">Mapa Comportamental</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="section"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fontSize: 9 }}
                    tickCount={5}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="hsl(var(--accent))"
                    fill="hsl(var(--accent))"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Section Details */}
        <div className="space-y-3">
          {sections.map((section) => {
            const s = result.sectionScores[section];
            const cfg = sectionConfig[section];
            return (
              <Card key={section} className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{cfg.icon}</span>
                    <h3 className="text-sm sm:text-base font-bold text-foreground">{section}</h3>
                    <span className="ml-auto text-sm sm:text-base font-bold text-foreground">
                      {s.percentage}%
                    </span>
                  </div>
                  <Progress value={s.percentage} className="h-2 mb-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {getSectionFeedback(section, s.percentage)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Back to Dashboard */}
        <div className="text-center pb-8">
          <Button onClick={onBack} className="gradient-accent text-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
};
