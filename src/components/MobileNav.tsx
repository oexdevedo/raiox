import { BrainIcon as Brain, Task01Icon as ClipboardList, ChartHistogramIcon as LineChart } from 'hugeicons-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  currentStep: number;
  onStepChange: (step: 1 | 2 | 3) => void;
  disabledSteps: boolean[];
}

export const MobileNav = ({ currentStep, onStepChange, disabledSteps }: MobileNavProps) => {
  const tabs = [
    { id: 1, label: 'Perfil', icon: Brain },
    { id: 2, label: 'Dados', icon: ClipboardList },
    { id: 3, label: 'Análise', icon: LineChart },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-card/80 backdrop-blur-lg border-t border-border/10 sm:hidden pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentStep === tab.id;
          const isDisabled = disabledSteps[tab.id - 1];

          return (
            <button
              key={tab.id}
              disabled={isDisabled}
              onClick={() => onStepChange(tab.id as 1 | 2 | 3)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300",
                isActive ? "text-accent scale-110" : "text-muted-foreground/60",
                isDisabled && "opacity-30 grayscale cursor-not-allowed"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive ? "bg-accent/10" : "bg-transparent"
              )}>
                <Icon className={cn("h-6 w-6", isActive ? "stroke-[2.5]" : "stroke-[2]")} />
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                isActive ? "opacity-100" : "opacity-60"
              )}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute top-0 h-1 w-8 bg-accent rounded-full animate-in fade-in zoom-in duration-300" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
