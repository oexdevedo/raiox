import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Income, Expense, FinancialAnalysis, CustomButtons } from '@/types/financial';
import { Download, FileText, ExternalLink } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

interface ReportDownloadProps {
  incomes: Income[];
  expenses: Expense[];
  analysis: FinancialAnalysis;
  userEmail: string;
  customButtons: CustomButtons;
}

export const ReportDownload = ({ incomes, expenses, analysis, userEmail, customButtons }: ReportDownloadProps) => {
  const [showDialog, setShowDialog] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusText = () => {
    switch (analysis.status) {
      case 'positive':
        return 'Você está ECONOMIZANDO! Parabéns!';
      case 'negative':
        return 'ATENÇÃO: Gastos acima da receita!';
      default:
        return 'Equilibrado: Gastos iguais às receitas';
    }
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(6, 26, 53);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Raio X Financeiro', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Relatório Financeiro Mensal', pageWidth / 2, 30, { align: 'center' });

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Usuário: ${userEmail}`, 14, 50);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 56);

    const boxY = 65;
    doc.setFillColor(223, 168, 63);
    doc.rect(14, boxY, pageWidth - 28, 35, 'F');
    doc.setTextColor(6, 26, 53);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(getStatusText(), pageWidth / 2, boxY + 12, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const incomeX = 20;
    const expenseX = pageWidth / 2;
    const balanceX = pageWidth - 20;
    doc.text(`Receitas: ${formatCurrency(analysis.totalIncome)}`, incomeX, boxY + 22);
    doc.text(`Despesas: ${formatCurrency(analysis.totalExpenses)}`, expenseX, boxY + 22, { align: 'center' });
    doc.text(`Saldo: ${formatCurrency(analysis.balance)}`, balanceX, boxY + 22, { align: 'right' });
    doc.text(`Dias restantes no mês: ${analysis.daysRemaining}`, pageWidth / 2, boxY + 30, { align: 'center' });

    doc.setTextColor(6, 26, 53);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Limites de Gastos Recomendados', 14, 115);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Por dia: ${formatCurrency(analysis.dailyLimit)}`, 14, 125);
    doc.text(`Por semana: ${formatCurrency(analysis.weeklyLimit)}`, 14, 132);
    doc.text(`Até o fim do mês: ${formatCurrency(analysis.monthlyLimit)}`, 14, 139);

    if (incomes.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Receitas', 14, 155);
      autoTable(doc, {
        startY: 160,
        head: [['Descrição', 'Data', 'Valor']],
        body: incomes.map(i => [i.description, new Date(i.date).toLocaleDateString('pt-BR'), formatCurrency(i.amount)]),
        headStyles: { fillColor: [34, 197, 94], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        margin: { left: 14, right: 14 },
      });
    }

    if (expenses.length > 0) {
      const lastY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : 170;
      const expenseStartY = lastY + 15;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Despesas', 14, expenseStartY);
      autoTable(doc, {
        startY: expenseStartY + 5,
        head: [['Descrição', 'Categoria', 'Data', 'Valor']],
        body: expenses.map(e => [e.description, e.category.charAt(0).toUpperCase() + e.category.slice(1), new Date(e.date).toLocaleDateString('pt-BR'), formatCurrency(e.amount)]),
        headStyles: { fillColor: [239, 68, 68], textColor: 255 },
        alternateRowStyles: { fillColor: [254, 242, 242] },
        margin: { left: 14, right: 14 },
      });
    }

    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFillColor(225, 226, 229);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Raio X Financeiro - Seu diagnóstico financeiro completo', pageWidth / 2, pageHeight - 6, { align: 'center' });

    doc.save(`raio-x-financeiro-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Relatório gerado com sucesso!');
  };

  const handleDownloadClick = () => {
    const statusButton =
      analysis.status === 'negative' ? customButtons.negative :
      analysis.status === 'neutral' ? customButtons.neutral :
      customButtons.positive;

    if (statusButton?.visible && statusButton?.label && statusButton?.url) {
      setShowDialog(true);
    } else {
      downloadReport();
    }
  };

  const statusButton =
    analysis.status === 'negative' ? customButtons.negative :
    analysis.status === 'neutral' ? customButtons.neutral :
    customButtons.positive;

  const colorClass =
    analysis.status === 'negative' ? 'bg-red-600 hover:bg-red-700' :
    analysis.status === 'neutral' ? 'bg-accent hover:filter hover:brightness-90' :
    'bg-emerald-600 hover:bg-emerald-700';

  return (
    <>
      <div className="card-hooked group border-dashed border-accent/30 bg-accent/5 hover:bg-accent/[0.08] transition-all flex flex-col justify-between h-full">
        <div className="p-6 sm:p-8 flex-1">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="p-5 rounded-3xl bg-accent shadow-lg shadow-accent/20 shrink-0 group-hover:scale-110 transition-transform">
              <FileText className="h-8 w-8 text-accent-foreground" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black text-foreground tracking-tight">Relatório Digital</h3>
              <p className="text-muted-foreground font-medium text-sm">Exporte seu diagnóstico completo em formato PDF profissional.</p>
            </div>
            
            <Button onClick={handleDownloadClick} className="btn-accent h-14 px-8 text-base font-black w-full shadow-xl shadow-accent/20 group-hover:bg-accent/90 transition-all rounded-2xl mt-4">
              <Download className="h-5 w-5 mr-3 stroke-[3]" />
              Gerar PDF
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-8 border-none shadow-2xl bg-background outline-none">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-center text-3xl font-black text-foreground tracking-tight">
              {getStatusText()}
            </DialogTitle>
            {statusButton?.message && (
              <DialogDescription className="text-center text-lg font-medium text-muted-foreground pt-2 leading-relaxed">
                {statusButton.message}
              </DialogDescription>
            )}
          </DialogHeader>
          
          <div className="flex flex-col gap-4 mt-10">
            {statusButton?.visible && statusButton?.label && statusButton?.url && (
              <Button
                asChild
                className={`${colorClass} text-white text-xl font-black h-16 shadow-xl shadow-accent/20 rounded-2xl group transition-all`}
              >
                <a href={statusButton.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                  {statusButton.label}
                  <ExternalLink className="h-6 w-6 stroke-[3] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </Button>
            )}
            
            <Button
              variant="ghost"
              onClick={() => {
                downloadReport();
                setShowDialog(false);
              }}
              className="h-14 rounded-2xl text-muted-foreground font-bold hover:text-foreground hover:bg-muted/50 transition-all"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar apenas o PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
