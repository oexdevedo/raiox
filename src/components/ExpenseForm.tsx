import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Expense } from '@/types/financial';
import { PlusSignIcon as Plus, Delete02Icon as Trash2, ArrowDownRight01Icon as TrendingDown, Dollar01Icon as DollarSign } from 'hugeicons-react';
import { toast } from 'sonner';

interface ExpenseFormProps {
  expenses: Expense[];
  onAdd: (description: string, amount: number, category: string) => void;
  onRemove: (id: string) => void;
}

const CATEGORIES = [
  { value: 'alimentacao', label: '🍔 Alimentação' },
  { value: 'moradia', label: '🏠 Moradia' },
  { value: 'transporte', label: '🚗 Transporte' },
  { value: 'saude', label: '💊 Saúde' },
  { value: 'educacao', label: '📚 Educação' },
  { value: 'lazer', label: '🎮 Lazer' },
  { value: 'compras', label: '🛍️ Compras' },
  { value: 'contas', label: '📄 Contas' },
  { value: 'dividas', label: '💳 Dívidas' },
  { value: 'pets', label: '🐾 Pets' },
  { value: 'cartao_credito', label: '💳 Cartão de Crédito' },
  { value: 'outros', label: '📦 Outros' },
];

export const ExpenseForm = ({ expenses, onAdd, onRemove }: ExpenseFormProps) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || !category) {
      toast.error('Preencha os dados da despesa');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('O valor deve ser maior que zero');
      return;
    }
    onAdd(description.trim(), numAmount, category);
    setDescription('');
    setAmount('');
    setCategory('');
    toast.success('Despesa registrada!');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getCategoryLabel = (value: string) => {
    return CATEGORIES.find(c => c.value === value)?.label || value;
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="card-hooked group min-h-full flex flex-col">
      <div className="p-4 sm:p-6 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 shadow-sm">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight">Despesas</h3>
          </div>
          <div className="px-4 py-2 rounded-xl bg-red-500/10">
            <span className="text-base sm:text-lg font-black text-red-600 tabular-nums">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expense-desc" className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Descrição</Label>
              <Input
                id="expense-desc"
                placeholder="Ex: Supermercado"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-11 bg-muted/20 border-border/40 focus:border-red-500/50 focus:ring-red-500/10 rounded-xl font-bold text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-amount" className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Valor</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-600/50" />
                <Input
                  id="expense-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-11 pl-9 bg-muted/20 border-border/40 focus:border-red-500/50 focus:ring-red-500/10 rounded-xl font-black tabular-nums text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-11 bg-muted/20 border-border/40 focus:border-red-500/50 focus:ring-red-500/10 rounded-xl font-bold text-sm">
                <SelectValue placeholder="Selecione o tipo de gasto" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="rounded-xl font-medium">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm gap-2 shadow-md shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="h-4 w-4 stroke-[3]" />
            Adicionar à Lista
          </Button>
        </form>

        {/* List */}
        {expenses.length > 0 && (
          <div className="space-y-3 pt-6 mt-6 border-t border-border/10">
            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-3">Lançamentos Recentes</p>
            <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/5 hover:border-red-500/20 transition-all group/item hover-lift shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 bg-red-500/20 rounded-full" />
                    <div>
                      <p className="font-black text-foreground leading-none mb-1.5">{expense.description}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {getCategoryLabel(expense.category)} • {new Date(expense.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-red-600 tabular-nums tracking-tighter">{formatCurrency(expense.amount)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(expense.id)}
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
