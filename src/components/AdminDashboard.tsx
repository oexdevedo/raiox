import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AdminCharts } from '@/components/AdminCharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, Users, Download, Save, CheckCircle2, AlertTriangle, XCircle, Settings2, FileSpreadsheet, FileText, LineChart, Pencil, Trash2, UserCheck, MessageSquare, Calendar, MoreHorizontal, Phone, User as UserIcon, Shield, Plus, Key } from 'lucide-react';
import { toast } from 'sonner';
import { apiGetUsers, apiGetIncomes, apiGetExpenses, apiGetBehavioral, apiGetInteractions, apiUpdateUser, apiDeleteUser, apiGetAdmins, apiCreateAdmin, apiDeleteAdmin, ApiUser, ApiAdmin } from '@/lib/api';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCustomButtons } from '@/hooks/useCustomButtons';
import { CustomButtons } from '@/types/financial';

interface UserWithFinancials {
  user_id: string;
  name: string;
  email: string;
  region: string;
  birth_date: string;
  whatsapp: string;
  profession: string;
  gender: string;
  contact_status: string;
  last_contact_at?: string;
  created_at: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  status: 'positive' | 'negative' | 'neutral';
  behavioralLevel: string;
  behavioralPercentage: number;
  visits: number;
}

export const AdminDashboard = () => {
  const { logout, user: currentUser } = useAuth();
  const { buttons, saveButtons, isLoading: loadingButtons } = useCustomButtons();
   const [users, setUsers] = useState<UserWithFinancials[]>([]);
   const [admins, setAdmins] = useState<ApiAdmin[]>([]);
   const [interactions, setInteractions] = useState<any[]>([]);
   const [loadingUsers, setLoadingUsers] = useState(true);
   const [config, setConfig] = useState<CustomButtons | null>(null);
  const [editingUser, setEditingUser] = useState<UserWithFinancials | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Add Admin State
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  
  const isMobile = useIsMobile();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (buttons) setConfig(buttons);
  }, [buttons]);

  const loadData = async () => {
    setLoadingUsers(true);
    try {
      const [allUsers, allInteractions, allAdmins] = await Promise.all([
        apiGetUsers(),
        apiGetInteractions().catch(() => []),
        apiGetAdmins().catch(() => [])
      ]);
      setInteractions(allInteractions);
      setAdmins(allAdmins);
      const enrichedUsers: UserWithFinancials[] = await Promise.all(
        allUsers.map(async (p: ApiUser) => {
          const [incomes, expenses, behavioral] = await Promise.allSettled([
            apiGetIncomes(p.email),
            apiGetExpenses(p.email),
            apiGetBehavioral(p.email),
          ]);

          const userIncomes = incomes.status === 'fulfilled' ? incomes.value : [];
          const userExpenses = expenses.status === 'fulfilled' ? expenses.value : [];
          const userBehavioral = behavioral.status === 'fulfilled' ? behavioral.value : null;

          const totalIncome = userIncomes.reduce((sum, i) => sum + Number(i.amount), 0);
          const totalExpenses = userExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
          const balance = totalIncome - totalExpenses;

          let status: 'positive' | 'negative' | 'neutral' = 'neutral';
          if (totalExpenses > totalIncome) status = 'negative';
          else if (totalExpenses < totalIncome) status = 'positive';

          const visits = allInteractions.filter((i: any) => i.user_email === p.email && i.action === 'register').length;

          return {
            user_id: String(p.id),
            name: p.name,
            email: p.email,
            region: p.region,
            birth_date: p.birth_date,
            whatsapp: p.whatsapp,
            profession: p.profession,
            gender: p.gender || '-',
            contact_status: p.contact_status || 'Pendente',
            last_contact_at: p.last_contact_at,
            created_at: p.created_at,
            totalIncome,
            totalExpenses,
            balance,
            status,
            behavioralLevel: userBehavioral?.level || '-',
            behavioralPercentage: userBehavioral?.total_percentage || 0,
            visits: Math.max(1, visits),
          };
        })
      );
      setUsers(enrichedUsers);
    } catch (err) {
      console.error('Error loading users:', err);
      toast.error('Erro ao carregar usuários');
    }
    setLoadingUsers(false);
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    setIsSaving(true);
    const result = await saveButtons(config);
    if (result.success) {
      toast.success('Configurações salvas com sucesso!');
    } else {
      toast.error('Erro ao salvar configurações');
    }
    setIsSaving(false);
  };

  const handleUpdateUser = async (email: string, updates: Partial<UserWithFinancials>) => {
    try {
      const { success, user } = await apiUpdateUser(email, updates);
      if (success) {
        toast.success('Lead atualizado!');
        loadData(); // Refresh all to keep charts in sync
        setEditingUser(null);
      }
    } catch (err) {
      toast.error('Erro ao atualizar lead');
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead permanentemente?')) return;
    try {
      await apiDeleteUser(email);
      toast.success('Lead removido!');
      loadData();
    } catch (err) {
      toast.error('Erro ao remover lead');
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdminEmail || !newAdminEmail.includes('@')) return toast.error('E-mail inválido');
    if (newAdminPassword.length < 6) return toast.error('A senha deve ter no mínimo 6 caracteres');
    
    setIsSaving(true);
    try {
      await apiCreateAdmin(newAdminEmail.trim(), newAdminPassword);
      toast.success('Administrador cadastrado com sucesso!');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setCreatingAdmin(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao cadastrar administrador');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAdmin = async (email: string) => {
    if (currentUser?.email === email) {
      return toast.error('Você não pode excluir a si mesmo!');
    }
    if (!confirm(`Revogar o acesso de administrador de ${email}?`)) return;
    
    try {
      await apiDeleteAdmin(email);
      toast.success('Administrador removido!');
      loadData();
    } catch (err) {
      toast.error('Erro ao remover administrador');
    }
  };

  const updateConfig = (status: keyof CustomButtons, field: string, value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      [status]: {
        ...config[status],
        [field]: value,
      },
    });
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Até logo!');
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'positive': return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">Verde</Badge>;
      case 'negative': return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 font-bold">Vermelho</Badge>;
      default: return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold">Amarelo</Badge>;
    }
  };

  const getExportRows = () => {
    return users.map(u => ({
      'Nome': u.name,
      'Email': u.email,
      'Sexo': u.gender,
      'Estado': u.region,
      'Profissão': u.profession,
      'WhatsApp': u.whatsapp,
      'Data Nascimento': u.birth_date,
      'Situação Financeira': u.status === 'positive' ? 'Verde' : u.status === 'negative' ? 'Vermelho' : 'Amarelo',
      'Saldo (R$)': u.balance.toFixed(2),
      'Diagnóstico Comportamental': `${u.behavioralLevel} (${u.behavioralPercentage}%)`,
      'Acessos Retornantes': u.visits,
      'Status de Contato': u.contact_status,
      'Último Contato': u.last_contact_at ? new Date(u.last_contact_at).toLocaleString('pt-BR') : '-',
      'Data Cadastro': new Date(u.created_at).toLocaleDateString('pt-BR'),
    }));
  };

  const exportCSV = () => {
    const rows = getExportRows();
    if (rows.length === 0) { toast.error('Nenhum dado para exportar'); return; }
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(';'), ...rows.map(r => Object.values(r).map(c => `"${c}"`).join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads-raiox-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('CSV exportado!');
  };

  const exportXLSX = () => {
    const rows = getExportRows();
    if (rows.length === 0) { toast.error('Nenhum dado para exportar'); return; }
    const headers = Object.keys(rows[0]);

    // Build XML for Open XML Spreadsheet (.xlsx via XML)
    const escapeXml = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    let sheetData = '<Row>';
    headers.forEach(h => { sheetData += `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`; });
    sheetData += '</Row>';

    rows.forEach(r => {
      sheetData += '<Row>';
      Object.values(r).forEach(v => {
        sheetData += `<Cell><Data ss:Type="String">${escapeXml(String(v))}</Data></Cell>`;
      });
      sheetData += '</Row>';
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="header">
   <Font ss:Bold="1" ss:Size="11"/>
   <Interior ss:Color="#DFA83F" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Leads">
  <Table>
   ${sheetData}
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads-raiox-${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    toast.success('Planilha Excel exportada!');
  };

  const getContactStatusBadge = (status: string) => {
    switch (status) {
      case 'Feito contato': return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 font-bold">Feito contato</Badge>;
      case 'Não responde': return <Badge variant="outline" className="bg-slate-500/10 text-slate-600 border-slate-500/20 font-bold">Não responde</Badge>;
      case 'Respondeu': return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">Respondeu</Badge>;
      default: return <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 font-bold">Pendente</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <header className="sticky top-0 z-50 bg-card/70 backdrop-blur-md border-b border-border/10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="sm" showText={false} />
              <div className="h-6 w-px bg-border/40" />
              <h1 className="text-sm font-black text-foreground uppercase tracking-widest hidden sm:block">Painel Admin</h1>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />
              <div className="h-6 w-px bg-border/40" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl h-10 px-3 gap-2 transition-all">
                    <Download className="h-4 w-4" />
                    <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">Exportar Leads</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={exportCSV} className="gap-3 cursor-pointer py-3">
                    <FileText className="h-4 w-4 text-emerald-500" />
                    <div>
                      <p className="font-bold text-sm">CSV</p>
                      <p className="text-[10px] text-muted-foreground">Separado por vírgulas</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportXLSX} className="gap-3 cursor-pointer py-3">
                    <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-bold text-sm">Excel (XLS)</p>
                      <p className="text-[10px] text-muted-foreground">Planilha formatada</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="sm" onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl h-10 px-3 gap-2 transition-all">
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-7xl">
        <Tabs defaultValue="charts" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/10 pb-6 mb-8">
            <div>
              <h2 className="text-3xl font-black text-foreground tracking-tight mb-1">Painel Executivo</h2>
              <p className="text-sm font-medium text-muted-foreground">Gerencie estrategicamente a sua isca digital.</p>
            </div>
            
            <TabsList className="bg-muted/20 p-1 rounded-2xl h-auto self-start">
              <TabsTrigger value="charts" className="rounded-xl py-2.5 px-5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2">
                <LineChart className="h-3.5 w-3.5" />
                Analítico
              </TabsTrigger>
              <TabsTrigger value="leads" className="rounded-xl py-2.5 px-5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />
                Leads
              </TabsTrigger>
              <TabsTrigger value="config" className="rounded-xl py-2.5 px-5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2">
                <Settings2 className="h-3.5 w-3.5" />
                Configurar
              </TabsTrigger>
              <TabsTrigger value="admins" className="rounded-xl py-2.5 px-5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" />
                Administradores
              </TabsTrigger>
            </TabsList>
          </div>

          {/* PAGE 1: CHARTS */}
          <TabsContent value="charts" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-primary" />
                  Métricas de Engajamento
                </h3>
                <Button onClick={loadData} variant="outline" size="sm" className="rounded-xl font-bold h-9">
                  Atualizar Gráficos
                </Button>
              </div>
              <AdminCharts users={users} interactions={interactions} />
            </div>
          </TabsContent>

          {/* PAGE 2: LEADS */}
          <TabsContent value="leads" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent" />
                  Base de Usuários ({users.length})
                </h3>
                <Button onClick={loadData} variant="ghost" size="sm" className="rounded-xl font-bold h-9 text-muted-foreground">
                  Sincronizar Leads
                </Button>
              </div>
              
              <Card className="card-hooked border-none overflow-hidden bg-card/50">
                <CardContent className="p-0 sm:p-6">
                  {loadingUsers ? (
                    <div className="text-center py-20">
                      <div className="animate-spin h-10 w-10 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4" />
                      <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Processando base de dados...</p>
                    </div>
                  ) : isMobile ? (
                    <div className="space-y-4 p-4">
                      {users.map((u) => (
                        <div key={u.user_id} className="p-5 rounded-2xl bg-muted/20 border border-border/10">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-lg font-black text-foreground leading-tight">{u.name}</p>
                              <p className="text-sm font-medium text-muted-foreground">{u.email} • <span className="font-bold">{u.gender}</span></p>
                            </div>
                            {getStatusBadge(u.status)}
                          </div>
                          {/* ... mobile card details same as before ... */}
                          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                            <div>
                              <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">Local</p>
                              <p className="text-sm font-bold text-foreground">{u.region}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">Status Contato</p>
                              {getContactStatusBadge(u.contact_status)}
                            </div>
                            <div className="col-span-2 flex gap-2 pt-4 border-t border-border/5">
                              <Button variant="outline" className="flex-1 h-9 rounded-xl text-xs font-black uppercase tracking-widest gap-2" onClick={() => setEditingUser(u)}>
                                <Pencil className="h-3 w-3" />
                                Editar
                              </Button>
                              <Button variant="ghost" className="flex-1 h-9 rounded-xl text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 gap-2" onClick={() => handleDeleteUser(u.email)}>
                                <Trash2 className="h-3 w-3" />
                                Remover
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent border-border/10">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 py-4">Nome / E-mail</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status Contato</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Local / Profissão</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">WhatsApp</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Visitas</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Situação</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Saldo</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Comportamental</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Última Interação</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((u) => (
                            <TableRow key={u.user_id} className="hover:bg-muted/30 border-border/10 transition-colors">
                              <TableCell className="px-6 py-4">
                                <div className="font-black text-foreground">{u.name}</div>
                                <div className="text-xs font-medium text-muted-foreground">{u.email}</div>
                              </TableCell>
                              <TableCell>
                                {getContactStatusBadge(u.contact_status)}
                              </TableCell>
                              <TableCell>
                                <div className="font-bold text-foreground">{u.region}</div>
                                <div className="text-xs font-medium text-muted-foreground">{u.profession}</div>
                              </TableCell>
                              <TableCell>
                                <div className="font-bold text-foreground">{u.whatsapp || '-'}</div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="secondary" className="font-black tabular-nums bg-accent/10 border-accent/20 text-accent">
                                  {u.visits}x
                                </Badge>
                              </TableCell>
                              <TableCell>{getStatusBadge(u.status)}</TableCell>
                              <TableCell>
                                <span className={`font-black tabular-nums ${u.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {formatCurrency(u.balance)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="font-bold text-foreground lowercase first-letter:uppercase">{u.behavioralLevel}</div>
                                <div className="text-xs font-black text-accent">{u.behavioralPercentage}%</div>
                              </TableCell>
                              <TableCell>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase leading-tight">
                                  {u.last_contact_at ? new Date(u.last_contact_at).toLocaleDateString('pt-BR') : 'Início:'}
                                </div>
                                <div className="text-xs font-medium">
                                  {new Date(u.last_contact_at || u.created_at).toLocaleDateString('pt-BR')}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => setEditingUser(u)} className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10 rounded-lg">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u.email)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PAGE 3: CONFIG */}
          <TabsContent value="config" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-primary" />
                  Regras de Engajamento
                </h3>
              </div>

              <Card className="card-hooked border-none overflow-hidden bg-card/50">
                <CardHeader className="pb-6 border-b border-border/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl font-black text-foreground">Alertas Condicionais</CardTitle>
                      <CardDescription className="text-xs font-medium">Configure os popups e botões para cada perfil financeiro.</CardDescription>
                    </div>
                    <Button onClick={handleSaveConfig} disabled={isSaving || !config} className="btn-accent h-11 px-6 rounded-xl font-black shadow-lg shadow-accent/20">
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Salvando...' : 'Publicar Alterações'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {loadingButtons || !config ? (
                    <div className="text-center py-12">
                      <div className="animate-spin h-6 w-6 border-3 border-accent border-t-transparent rounded-full mx-auto" />
                    </div>
                  ) : (
                    <Tabs defaultValue="negative" className="w-full">
                      <TabsList className="grid grid-cols-3 mb-8 bg-muted/20 p-1 rounded-2xl h-auto">
                        <TabsTrigger value="negative" className="rounded-xl py-3 font-black text-xs uppercase tracking-widest data-[state=active]:bg-red-500 data-[state=active]:text-white transition-all">
                          🔴 Vermelho
                        </TabsTrigger>
                        <TabsTrigger value="neutral" className="rounded-xl py-3 font-black text-xs uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all">
                          🟡 Amarelo
                        </TabsTrigger>
                        <TabsTrigger value="positive" className="rounded-xl py-3 font-black text-xs uppercase tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">
                          🟢 Verde
                        </TabsTrigger>
                      </TabsList>

                      {(['negative', 'neutral', 'positive'] as const).map((status) => (
                        <TabsContent key={status} value={status} className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/10">
                            <div className="flex items-center gap-3">
                              {status === 'negative' && <XCircle className="h-5 w-5 text-red-500" />}
                              {status === 'neutral' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                              {status === 'positive' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                              <div>
                                <p className="text-sm font-black text-foreground">Habilitar Aviso</p>
                                <p className="text-[10px] font-medium text-muted-foreground">Define se este popup aparecerá para o usuário</p>
                              </div>
                            </div>
                            <Switch 
                              checked={config?.[status]?.visible || false} 
                              onCheckedChange={(val) => updateConfig(status, 'visible', val)}
                              className="data-[state=checked]:bg-accent"
                            />
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Mensagem do Popup</Label>
                              <Textarea 
                                placeholder="Texto que aparecerá para o usuário..."
                                value={config[status].message}
                                onChange={(e) => updateConfig(status, 'message', e.target.value)}
                                className="min-h-[120px] rounded-2xl bg-muted/10 border-border/40 focus:border-accent text-sm font-medium resize-none p-4"
                              />
                            </div>
                            <div className="space-y-6">
                              <div className="space-y-3">
                                <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Texto do Botão (CTA)</Label>
                                <Input 
                                  placeholder="Ex: Quero ajuda agora"
                                  value={config[status].label}
                                  onChange={(e) => updateConfig(status, 'label', e.target.value)}
                                  className="h-12 rounded-xl bg-muted/10 border-border/40 focus:border-accent text-sm font-bold p-4"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Link de Destino</Label>
                                <Input 
                                  placeholder="https://wa.me/..."
                                  value={config[status].url}
                                  onChange={(e) => updateConfig(status, 'url', e.target.value)}
                                  className="h-12 rounded-xl bg-muted/10 border-border/40 focus:border-accent text-sm font-medium p-4 font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PAGE 4: ADMINS */}
          <TabsContent value="admins" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Shield className="h-5 w-5 text-accent" /> Equipe Administrativa
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Gerencie quem tem acesso total a este painel e aos leads.</p>
                </div>
                <Button onClick={() => setCreatingAdmin(true)} className="btn-accent h-10 px-4 rounded-xl gap-2 font-bold shadow-md">
                  <Plus className="h-4 w-4 stroke-[3]" /> Adicionar Admin
                </Button>
              </div>

              <Card className="border-border/10 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/10">
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 py-4">Administrador (E-mail)</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Adicionado em</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right px-6">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((a) => (
                      <TableRow key={a.id} className="hover:bg-muted/30 border-border/10 transition-colors">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                              <Shield className="h-4 w-4 text-accent" />
                            </div>
                            <span className="font-bold text-foreground">{a.email}</span>
                            {currentUser?.email === a.email && (
                              <Badge variant="outline" className="ml-2 text-[10px] uppercase font-black bg-primary/10 text-primary border-primary/20">Você</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-muted-foreground">
                            {new Date(a.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteAdmin(a.email)} disabled={currentUser?.email === a.email}
                            className="text-red-500 hover:text-red-700 hover:bg-red-500/10 h-8 gap-2 font-bold">
                            <Trash2 className="h-4 w-4" /> Revogar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {admins.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground font-medium">
                          Nenhum administrador encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Admin Dialog */}
      <Dialog open={creatingAdmin} onOpenChange={setCreatingAdmin}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6 border-border/10 shadow-2xl">
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-accent/15 border border-accent/20">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <DialogTitle className="text-xl font-bold">Novo Administrador</DialogTitle>
            </div>
            <DialogDescription className="text-sm">
              Conceda acesso integral ao painel incluindo edição de leads, exportação e configuração.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="font-bold ml-1 text-foreground/80">E-mail de Acesso</Label>
              <Input
                type="email"
                placeholder="coleta@exemplo.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="h-12 bg-muted/30 border-border/50 text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-bold ml-1 text-foreground/80">Definir Senha</Label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  type="text"
                  placeholder="Senha forte..."
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="h-12 pl-10 bg-muted/30 border-border/50 text-base"
                />
              </div>
              <p className="text-[10px] text-muted-foreground ml-1">Mínimo de 6 caracteres.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border/10">
            <Button variant="ghost" onClick={() => setCreatingAdmin(false)} className="rounded-xl font-bold">
              Cancelar
            </Button>
            <Button onClick={handleCreateAdmin} disabled={isSaving} className="btn-accent rounded-xl px-6 font-bold shadow-md">
              {isSaving ? 'Salvando...' : 'Cadastrar Admin'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* EDIT LEAD DIALOG */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
          <div className="bg-primary p-8 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Pencil className="h-24 w-24" />
            </div>
            <DialogTitle className="text-2xl font-black uppercase tracking-widest mb-1 leading-none">Editar Lead</DialogTitle>
            <DialogDescription className="text-white/60 font-medium text-xs tracking-wider uppercase">
              Gerenciar informações e status de contato
            </DialogDescription>
          </div>
          
          <div className="p-8 space-y-6 bg-background">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nome Completo</Label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/50" />
                  <Input 
                    value={editingUser?.name || ''} 
                    onChange={(e) => setEditingUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="pl-12 h-12 rounded-xl bg-muted/20 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/50" />
                  <Input 
                    value={editingUser?.whatsapp || ''} 
                    onChange={(e) => setEditingUser(prev => prev ? { ...prev, whatsapp: e.target.value } : null)}
                    className="pl-12 h-12 rounded-xl bg-muted/20 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Status de Contato</Label>
                <Select 
                  value={editingUser?.contact_status || 'Pendente'} 
                  onValueChange={(val) => setEditingUser(prev => prev ? { ...prev, contact_status: val } : null)}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none focus:ring-2 focus:ring-primary/20 font-bold">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-xl">
                    <SelectItem value="Pendente" className="font-bold">Pendente</SelectItem>
                    <SelectItem value="Feito contato" className="font-bold text-blue-600">Feito contato</SelectItem>
                    <SelectItem value="Não responde" className="font-bold text-slate-500">Não responde</SelectItem>
                    <SelectItem value="Respondeu" className="font-bold text-emerald-600">Respondeu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Data da Interação (Manual)</Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/50" />
                  <Input 
                    type="datetime-local"
                    value={editingUser?.last_contact_at ? new Date(new Date(editingUser.last_contact_at).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingUser(prev => prev ? { ...prev, last_contact_at: val ? val.replace('T', ' ') + ':00' : undefined } : null);
                    }}
                    className="pl-12 h-12 rounded-xl bg-muted/20 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="ghost" 
                onClick={() => setEditingUser(null)}
                className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-muted/50"
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => editingUser && handleUpdateUser(editingUser.email, editingUser)}
                className="flex-[2] h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
              >
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
