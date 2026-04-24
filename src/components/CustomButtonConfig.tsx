import { useCustomButtons } from '@/hooks/useCustomButtons';
import { StatusButton, CustomButtons } from '@/types/financial';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ArrowUpRight01Icon as ExternalLink, Alert01Icon as AlertTriangle, MinusSignCircleIcon as MinusCircle, CheckmarkCircle02Icon as CheckCircle, FloppyDiskIcon as Save } from 'hugeicons-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const STATUS_CONFIG = [
  {
    key: 'negative' as const,
    title: '🔴 Botão Vermelho — Gastando mais do que recebe',
    icon: AlertTriangle,
    color: 'text-red-500',
    border: 'border-red-200',
  },
  {
    key: 'neutral' as const,
    title: '🟡 Botão Amarelo — Gastando igual ao que recebe',
    icon: MinusCircle,
    color: 'text-yellow-500',
    border: 'border-yellow-200',
  },
  {
    key: 'positive' as const,
    title: '🟢 Botão Verde — Gastando menos do que recebe',
    icon: CheckCircle,
    color: 'text-green-500',
    border: 'border-green-200',
  },
];

export const CustomButtonConfig = () => {
  const { buttons, saveButtons } = useCustomButtons();
  const [draft, setDraft] = useState<CustomButtons>(buttons);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setDraft(buttons);
  }, [buttons]);

  const updateDraft = (key: 'negative' | 'neutral' | 'positive', field: keyof StatusButton, value: string | boolean) => {
    setDraft(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveButtons(draft);
    setHasChanges(false);
    toast.success('Configurações dos botões salvas com sucesso!');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Botões por Resultado Financeiro
          </CardTitle>
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="gradient-accent text-primary hover:opacity-90"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {STATUS_CONFIG.map(({ key, title, border }) => (
          <div key={key} className={`border ${border} rounded-lg p-4 space-y-3`}>
            <h3 className="font-semibold text-sm">{title}</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor={`btn-${key}-visible`}>Exibir botão</Label>
              <Switch
                id={`btn-${key}-visible`}
                checked={draft[key].visible}
                onCheckedChange={(checked) => updateDraft(key, 'visible', checked)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`btn-${key}-label`}>Nome do botão</Label>
              <Input
                id={`btn-${key}-label`}
                placeholder="Ex: Acessar consultoria"
                value={draft[key].label}
                onChange={(e) => updateDraft(key, 'label', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`btn-${key}-url`}>Link do botão</Label>
              <Input
                id={`btn-${key}-url`}
                placeholder="https://exemplo.com"
                value={draft[key].url}
                onChange={(e) => updateDraft(key, 'url', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`btn-${key}-message`}>Mensagem do popup</Label>
              <Input
                id={`btn-${key}-message`}
                placeholder="Ex: Você está no caminho certo! Clique abaixo para saber mais."
                value={draft[key].message || ''}
                onChange={(e) => updateDraft(key, 'message', e.target.value)}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
