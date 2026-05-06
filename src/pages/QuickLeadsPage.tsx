import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  UserCircleIcon as UserIcon, 
  Mail01Icon as MailIcon, 
  SmartPhone01Icon as PhoneIcon,
  CheckmarkBadge01Icon as CheckBadge,
  ArrowRight01Icon as ArrowRight
} from 'hugeicons-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { apiRegister } from '@/lib/api';
import { isValidEmail, isValidFullName, isValidBrazilianPhone } from '@/lib/validators';

const QuickLeadsPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const formatWhatsapp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(formatWhatsapp(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    const nameVal = isValidFullName(name);
    if (!nameVal.valid) return toast.error(nameVal.error);
    
    const emailVal = isValidEmail(email);
    if (!emailVal.valid) return toast.error(emailVal.error);
    
    const phoneVal = isValidBrazilianPhone(whatsapp);
    if (!phoneVal.valid) return toast.error(phoneVal.error);

    setIsSubmitting(true);
    try {
      // Direct call to supabase to avoid dependency on api.ts which might not be updated on server
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: 'TemporaryPassword123!',
        options: {
          data: {
            name,
            whatsapp,
            region: 'Não informado',
            profession: 'Lead Rápido',
            gender: 'Não informado',
            birthDate: '0000-00-00'
          }
        }
      });

      if (signUpError) throw signUpError;

      // Fallback: Manually insert/upsert into profiles table to ensure it shows up in Admin
      // This covers cases where the trigger might be delayed or fail
      if (data.user) {
        await supabase.from('profiles').upsert({
          user_id: data.user.id,
          name,
          email: email.trim().toLowerCase(),
          whatsapp,
          region: 'Não informado',
          profession: 'Lead Rápido',
          birth_date: '0000-00-00'
        }, { onConflict: 'user_id' });
      }
      
      setIsSuccess(true);
      toast.success('Dados enviados com sucesso!');
    } catch (err: any) {
      if (err.message?.includes('already registered')) {
        toast.info('Este e-mail já está em nossa base.');
        setIsSuccess(true);
      } else {
        toast.error('Erro ao enviar dados. Tente novamente.');
        console.error(err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-background items-center justify-center p-4">
        <Card className="w-full max-w-md card-hooked border-none shadow-2xl overflow-hidden">
          <CardContent className="p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckBadge className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-black text-foreground">Quase lá!</h1>
            <p className="text-muted-foreground font-medium">
              Seus dados foram registrados. Em breve você receberá as instruções para o acesso antecipado ao <span className="text-accent font-bold">Tutu</span>.
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="w-full h-14 rounded-2xl font-bold border-border/10 hover:bg-muted/50"
            >
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-500 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />

      <header className="relative z-10 p-4 sm:p-6 flex justify-between items-center bg-card/30 backdrop-blur-sm border-b border-border/10">
        <Logo size="sm" />
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-foreground tracking-tight">Cadastro</h1>
            <p className="text-sm font-medium text-muted-foreground">Receba acesso antecipado ao <span className="text-accent font-bold">Tutu</span> assistente financeiro</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nome Completo</Label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                <Input 
                  type="text" 
                  placeholder="Seu nome aqui" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 pl-12 bg-card border-border/10 focus-visible:ring-accent rounded-2xl font-medium"
                  required 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">E-mail</Label>
              <div className="relative">
                <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                <Input 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 pl-12 bg-card border-border/10 focus-visible:ring-accent rounded-2xl font-medium"
                  required 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">WhatsApp</Label>
              <div className="relative">
                <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                <Input 
                  type="tel" 
                  placeholder="(00) 00000-0000" 
                  value={whatsapp} 
                  onChange={handleWhatsappChange}
                  className="h-14 pl-12 bg-card border-border/10 focus-visible:ring-accent rounded-2xl font-medium"
                  required 
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-16 text-lg font-black btn-accent rounded-2xl shadow-xl shadow-accent/20 mt-6 group"
            >
              {isSubmitting ? 'Garantindo Acesso...' : (
                <>
                  Garantir Meu Acesso
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest opacity-40">
            Sua privacidade é nossa prioridade absoluta.
          </p>
        </div>
      </main>
    </div>
  );
};

export default QuickLeadsPage;
