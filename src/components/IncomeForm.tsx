import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Income } from '@/types/financial';
import { Plus, Trash2, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface IncomeFormProps {
  incomes: Income[];
  onAdd: (description: string, amount: number) => void;
  onRemove: (id: string) => void;
}

export const IncomeForm = ({ incomes, onAdd, onRemove }: IncomeFormProps) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) {
      toast.error('Preencha os dados da receita');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('O valor deve ser maior que zero');
      return;
    }
    onAdd(description.trim(), numAmount);
    setDescription('');
    setAmount('');
    toast.success('Receita adicionada com sucesso!');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const total = incomes.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="card-hooked group min-h-full flex flex-col">
      <div className="p-6 sm:p-8 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="text-xl font-black text-foreground tracking-tight">Receitas</h3>
          </div>
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10">
            <span className="text-lg font-black text-emerald-600 tabular-nums">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="income-desc" className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Descrição</Label>
              <Input
                id="income-desc"
                placeholder="Ex: Salário"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-12 bg-muted/20 border-border/40 focus:border-emerald-500/50 focus:ring-emerald-500/10 rounded-xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="income-amount" className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Valor</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600/50" />
                <Input
                  id="income-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12 pl-9 bg-muted/20 border-border/40 focus:border-emerald-500/50 focus:ring-emerald-500/10 rounded-xl font-black tabular-nums"
                />
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base gap-3 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="h-5 w-5 stroke-[3]" />
            Adicionar à Lista
          </Button>
        </form>

        {/* List */}
        {incomes.length > 0 && (
          <div className="space-y-3 pt-8 mt-8 border-t border-border/10">
            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-4">Lançamentos Recentes</p>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              {incomes.map((income) => (
                <div
                  key={income.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/5 hover:border-emerald-500/20 transition-all group/item hover-lift shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 bg-emerald-500/20 rounded-full" />
                    <div>
                      <p className="font-black text-foreground leading-none mb-1.5">{income.description}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {new Date(income.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-emerald-600 tabular-nums tracking-tighter">{formatCurrency(income.amount)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(income.id)}
                      className="h-10 w-10 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
