export type SectionName = "Passado" | "Presente" | "Futuro" | "Revolução";

export type Question = {
  id: number;
  section: SectionName;
  text: string;
};

export type Option = {
  value: number;
  label: string;
};

export const options: Option[] = [
  { value: 1, label: "Nunca / Discordo totalmente / Não" },
  { value: 2, label: "Raramente / Discordo em parte / Poucas vezes" },
  { value: 3, label: "Frequentemente / Concordo em parte / Algumas vezes" },
  { value: 4, label: "Sempre / Concordo totalmente / Sim" },
];

export const questions: Question[] = [
  // Passado (5 perguntas)
  { id: 1, section: "Passado", text: "Você reflete sobre como a relação dos seus pais com o dinheiro influenciou a sua?" },
  { id: 2, section: "Passado", text: "Você consegue identificar padrões financeiros repetitivos na sua família?" },
  { id: 3, section: "Passado", text: "Você já superou alguma dívida importante ou momento financeiro difícil?" },
  { id: 4, section: "Passado", text: "Você perdoou erros financeiros que cometeu no passado?" },
  { id: 5, section: "Passado", text: "Você sente que aprendeu lições valiosas com suas experiências financeiras anteriores?" },

  // Presente (7 perguntas)
  { id: 6, section: "Presente", text: "Você sabe exatamente quanto gasta por mês (incluindo pequenos gastos)?" },
  { id: 7, section: "Presente", text: "Você consegue identificar seus 'gastos invisíveis' (assinaturas não usadas, tarifas, etc.)?" },
  { id: 8, section: "Presente", text: "Você consegue resistir a compras por impulso quando está emocionalmente abalado(a)?" },
  { id: 9, section: "Presente", text: "Você evita parcelar compras do dia a dia no cartão de crédito?" },
  { id: 10, section: "Presente", text: "Você sente que seu estilo de vida cabe confortavelmente no seu orçamento atual?" },
  { id: 11, section: "Presente", text: "Você tem uma reserva de emergência ou está construindo uma ativamente?" },
  { id: 12, section: "Presente", text: "Você consegue dizer 'não' para compromissos sociais que estouram seu orçamento?" },

  // Futuro (5 perguntas)
  { id: 13, section: "Futuro", text: "Você tem clareza sobre quais são seus maiores sonhos financeiros?" },
  { id: 14, section: "Futuro", text: "Você tem metas financeiras definidas para os próximos 12 meses?" },
  { id: 15, section: "Futuro", text: "Você enxerga o dinheiro como uma ferramenta para realizar seus objetivos de vida?" },
  { id: 16, section: "Futuro", text: "Você investe regularmente pensando na sua liberdade financeira futura?" },
  { id: 17, section: "Futuro", text: "Você se sente otimista em relação à sua vida financeira daqui a 5 anos?" },

  // Revolução (3 perguntas)
  { id: 18, section: "Revolução", text: "Você aplica a regra de viver com 60% ou menos da sua renda (para cobrir o presente)?" },
  { id: 19, section: "Revolução", text: "Você dedica parte dos seus recursos para resolver pendências do passado (se houver)?" },
  { id: 20, section: "Revolução", text: "Você destina pelo menos 10% da sua renda para construir seu futuro?" },
];

export const sections: SectionName[] = ["Passado", "Presente", "Futuro", "Revolução"];

export const sectionConfig: Record<SectionName, { icon: string; color: string; description: string }> = {
  Passado: {
    icon: "⏪",
    color: "hsl(var(--accent))",
    description: "Sua relação histórica com o dinheiro",
  },
  Presente: {
    icon: "📍",
    color: "hsl(var(--primary))",
    description: "Seus hábitos financeiros atuais",
  },
  Futuro: {
    icon: "🚀",
    color: "hsl(var(--success))",
    description: "Seu planejamento e visão de futuro",
  },
  Revolução: {
    icon: "⚡",
    color: "hsl(var(--warning))",
    description: "Sua capacidade de transformação",
  },
};

export interface BehavioralAnswers {
  [questionId: number]: number;
}

export interface BehavioralResult {
  sectionScores: Record<SectionName, { score: number; maxScore: number; percentage: number }>;
  totalScore: number;
  totalMaxScore: number;
  totalPercentage: number;
  level: string;
  levelColor: string;
}

export const calculateBehavioralResult = (answers: BehavioralAnswers): BehavioralResult => {
  const sectionScores = {} as Record<SectionName, { score: number; maxScore: number; percentage: number }>;

  for (const section of sections) {
    const sectionQuestions = questions.filter(q => q.section === section);
    const maxScore = sectionQuestions.length * 4;
    const score = sectionQuestions.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
    sectionScores[section] = {
      score,
      maxScore,
      percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
    };
  }

  const totalScore = Object.values(sectionScores).reduce((s, v) => s + v.score, 0);
  const totalMaxScore = Object.values(sectionScores).reduce((s, v) => s + v.maxScore, 0);
  const totalPercentage = Math.round((totalScore / totalMaxScore) * 100);

  let level: string;
  let levelColor: string;
  if (totalPercentage >= 80) {
    level = "Excelente";
    levelColor = "text-success";
  } else if (totalPercentage >= 60) {
    level = "Bom";
    levelColor = "text-accent";
  } else if (totalPercentage >= 40) {
    level = "Regular";
    levelColor = "text-warning";
  } else {
    level = "Crítico";
    levelColor = "text-destructive";
  }

  return { sectionScores, totalScore, totalMaxScore, totalPercentage, level, levelColor };
};
