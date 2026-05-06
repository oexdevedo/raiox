import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  ArrowRight01Icon as ArrowRight, 
  BrainIcon as Brain, 
  ChartHistogramIcon as ChartIcon, 
  UserCircleIcon as UserIcon,
  CheckmarkBadge01Icon as CheckBadge,
  SparklesIcon as Sparkles
} from 'hugeicons-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage = ({ onStart }: LandingPageProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500 overflow-x-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <header className="relative z-10 p-4 sm:p-6 bg-card/30 backdrop-blur-md border-b border-border/10">
        <div className="container mx-auto flex justify-between items-center">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4">
          <div className="container mx-auto max-w-4xl text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 animate-in fade-in slide-in-from-top-4 duration-700">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-xs font-black uppercase tracking-widest text-accent">Diagnóstico Comportamental Avançado</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              Descubra por que o dinheiro <br className="hidden sm:block" /> 
              <span className="text-accent italic">foge de você.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 text-center sm:text-justify [text-align-last:center]">
              Existe um <span className="text-foreground font-bold">padrão invisível</span> por trás do seu extrato bancário. 
              Descubra qual é a sua verdadeira <span className="text-accent font-black tracking-tight">identidade financeira</span> e por que você gasta exatamente da forma que gasta.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Button 
                onClick={onStart}
                className="h-16 px-10 text-xl font-black btn-accent rounded-2xl shadow-xl shadow-accent/20 hover:scale-105 transition-all group w-full sm:w-auto"
              >
                Começar Meu Raio X
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="pt-12 flex flex-wrap justify-center gap-8 opacity-50 animate-in fade-in duration-1000 delay-500">
              <div className="flex items-center gap-2">
                <CheckBadge className="h-5 w-5 text-accent" />
                <span className="text-xs font-bold uppercase tracking-tighter">100% Gratuito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckBadge className="h-5 w-5 text-accent" />
                <span className="text-xs font-bold uppercase tracking-tighter">Relatório Personalizado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckBadge className="h-5 w-5 text-accent" />
                <span className="text-xs font-bold uppercase tracking-tighter">Privacidade Garantida</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/5">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="card-hooked p-8 space-y-6 group hover:-translate-y-2 transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Brain className="h-8 w-8 text-accent" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black tracking-tight">1. Perfil Psicológico</h3>
                  <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                    Identificamos seus gatilhos emocionais e padrões de comportamento que sabotam suas finanças.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="card-hooked p-8 space-y-6 group hover:-translate-y-2 transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <ChartIcon className="h-8 w-8 text-primary dark:text-accent" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black tracking-tight">2. Análise de Gastos</h3>
                  <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                    Um diagnóstico real sobre suas receitas e despesas, sem planilhas complexas ou burocracia.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="card-hooked p-8 space-y-6 group hover:-translate-y-2 transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <UserIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black tracking-tight">3. Relatório da Vida</h3>
                  <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                    Você recebe um PDF detalhado com o seu diagnóstico e os próximos passos para a liberdade.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 overflow-hidden relative">
          <div className="container mx-auto max-w-4xl relative z-10">
            <div className="card-hooked p-8 sm:p-16 text-center space-y-8 bg-primary text-primary-foreground border-none shadow-2xl relative overflow-hidden">
              {/* Background texture */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" 
                   style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
              
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight relative z-10">
                Pronto para ver o que <br />
                <span className="text-accent">os números não mostram?</span>
              </h2>
              <p className="text-primary-foreground/70 text-lg font-medium max-w-xl mx-auto relative z-10">
                Junte-se a milhares de pessoas que já entenderam que finanças é 20% matemática e 80% comportamento.
              </p>
              <Button 
                onClick={onStart}
                className="h-16 px-12 text-xl font-black btn-accent rounded-2xl shadow-xl hover:scale-105 transition-all relative z-10"
              >
                Quero Meu Diagnóstico Agora
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 py-12 border-t border-border/10 bg-card/30">
        <div className="container mx-auto px-4 text-center space-y-6">
          <div className="flex items-center justify-center gap-3 grayscale opacity-40">
            <Logo size="sm" showText={false} />
            <div className="h-4 w-px bg-foreground" />
            <span className="text-xs font-black uppercase tracking-widest text-foreground">Ex Devedor</span>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} Raio X Ex Devedor • Transformando Vidas através da Mentalidade
          </p>
        </div>
      </footer>
    </div>
  );
};
