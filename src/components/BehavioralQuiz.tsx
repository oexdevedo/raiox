import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft01Icon as ChevronLeft, ArrowRight01Icon as ChevronRight, BrainIcon as Brain } from 'hugeicons-react';
import {
  questions,
  options,
  sections,
  sectionConfig,
  BehavioralAnswers,
  SectionName,
} from '@/types/behavioral';

interface BehavioralQuizProps {
  onComplete: (answers: BehavioralAnswers) => void;
  onBack: () => void;
}

export const BehavioralQuiz = ({ onComplete, onBack }: BehavioralQuizProps) => {
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<BehavioralAnswers>({});

  const currentSection = sections[currentSectionIdx];
  const sectionQuestions = questions.filter(q => q.section === currentSection);
  const currentQuestion = sectionQuestions[currentQuestionIdx];

  const totalAnswered = Object.keys(answers).length;
  const progress = (totalAnswered / questions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: parseInt(value) }));
  };

  const goNext = () => {
    if (currentQuestionIdx < sectionQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else if (currentSectionIdx < sections.length - 1) {
      setCurrentSectionIdx(prev => prev + 1);
      setCurrentQuestionIdx(0);
    } else {
      onComplete(answers);
    }
  };

  const goPrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    } else if (currentSectionIdx > 0) {
      const prevSection = sections[currentSectionIdx - 1];
      const prevQuestions = questions.filter(q => q.section === prevSection);
      setCurrentSectionIdx(prev => prev - 1);
      setCurrentQuestionIdx(prevQuestions.length - 1);
    }
  };

  const isFirst = currentSectionIdx === 0 && currentQuestionIdx === 0;
  const isLast = currentSectionIdx === sections.length - 1 && currentQuestionIdx === sectionQuestions.length - 1;
  const hasAnswer = answers[currentQuestion.id] !== undefined;

  const config = sectionConfig[currentSection];

  // Global question number
  const globalIdx = questions.findIndex(q => q.id === currentQuestion.id) + 1;

  return (
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-2xl">
        {/* Progress */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-2">
            <span>Pergunta {globalIdx} de {questions.length}</span>
            <span>{Math.round(progress)}% completo</span>
          </div>
          <Progress value={progress} className="h-2 sm:h-3" />
        </div>

        {/* Section indicator */}
        <div className="flex items-center gap-2 mb-4">
          {sections.map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i < currentSectionIdx
                  ? 'bg-success'
                  : i === currentSectionIdx
                  ? 'bg-accent'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Section title */}
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <span className="text-xl sm:text-2xl">{config.icon}</span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">{currentSection}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>

        {/* Question Card */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-lg font-semibold leading-relaxed text-foreground">
              {currentQuestion.text}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[currentQuestion.id]?.toString() || ''}
              onValueChange={handleAnswer}
              className="space-y-2 sm:space-y-3"
            >
              {options.map((opt) => (
                <div
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    answers[currentQuestion.id] === opt.value
                      ? 'border-accent bg-accent/10'
                      : 'border-muted hover:border-accent/50 hover:bg-muted/50'
                  }`}
                  onClick={() => handleAnswer(opt.value.toString())}
                >
                  <RadioGroupItem value={opt.value.toString()} id={`opt-${opt.value}`} />
                  <Label
                    htmlFor={`opt-${opt.value}`}
                    className="text-xs sm:text-sm cursor-pointer flex-1"
                  >
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4 sm:mt-6">
          <Button
            variant="outline"
            onClick={isFirst ? onBack : goPrev}
            size="sm"
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{isFirst ? 'Voltar' : 'Anterior'}</span>
          </Button>

          <Button
            onClick={goNext}
            disabled={!hasAnswer}
            size="sm"
            className="gradient-accent text-white gap-1 font-bold shadow-md"
          >
            <span>{isLast ? 'Ver Resultado' : 'Próxima'}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};
