import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { ChartHistogramIcon as BarChart3 } from 'hugeicons-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface UserData {
  name: string;
  email: string;
  region: string;
  birth_date: string;
  profession: string;
  gender: string;
  status: 'positive' | 'negative' | 'neutral';
  behavioralLevel: string;
  behavioralPercentage: number;
}

interface AdminChartsProps {
  users: any[];
  interactions: any[];
}

const COLORS = [
  'hsl(215, 71%, 12%)',
  'hsl(38, 68%, 56%)',
  'hsl(142, 76%, 36%)',
  'hsl(0, 84%, 60%)',
  'hsl(39, 95%, 76%)',
  'hsl(215, 60%, 40%)',
  'hsl(280, 60%, 50%)',
  'hsl(180, 60%, 40%)',
];

export const AdminCharts = ({ users, interactions }: AdminChartsProps) => {
  const isMobile = useIsMobile();

  const getAgeDistribution = () => {
    const ranges: Record<string, number> = { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56-65': 0, '65+': 0 };
    const now = new Date();
    users.forEach(u => {
      if (!u.birth_date) return;
      const birth = new Date(u.birth_date);
      const age = Math.floor((now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age <= 25) ranges['18-25']++;
      else if (age <= 35) ranges['26-35']++;
      else if (age <= 45) ranges['36-45']++;
      else if (age <= 55) ranges['46-55']++;
      else if (age <= 65) ranges['56-65']++;
      else ranges['65+']++;
    });
    return Object.entries(ranges).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  };

  const getRegionDistribution = () => {
    const counts: Record<string, number> = {};
    users.forEach(u => {
      if (!u.region) return;
      const state = u.region.match(/\((\w+)\)/)?.[1] || u.region;
      counts[state] = (counts[state] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  };

  const getProfessionDistribution = () => {
    const counts: Record<string, number> = {};
    users.forEach(u => {
      const prof = (u.profession || 'Não informado').trim();
      counts[prof] = (counts[prof] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  };

  const GENDER_COLORS: Record<string, string> = {
    'Masculino': 'hsl(215, 71%, 45%)',
    'Feminino': 'hsl(330, 65%, 55%)',
    'Outro': 'hsl(270, 50%, 55%)',
    'Não informado': 'hsl(0, 0%, 60%)',
  };

  const getGenderDistribution = () => {
    const counts: Record<string, number> = {};
    users.forEach(u => {
      const g = (u.gender || '').trim();
      const label = g === 'Masculino' || g === 'Feminino' || g === 'Outro' ? g : 'Não informado';
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, color: GENDER_COLORS[name] || 'hsl(0,0%,60%)' }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  const getStatusDistribution = () => {
    let positive = 0, negative = 0, neutral = 0;
    users.forEach(u => {
      if (u.status === 'positive') positive++;
      else if (u.status === 'negative') negative++;
      else neutral++;
    });
    return [
      { name: 'Verde', value: positive, color: 'hsl(142, 76%, 36%)' },
      { name: 'Amarelo', value: neutral, color: 'hsl(38, 68%, 56%)' },
      { name: 'Vermelho', value: negative, color: 'hsl(0, 84%, 60%)' },
    ].filter(d => d.value > 0);
  };

  const getActivityByHour = () => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}h`, interactions: 0 }));
    
    // Mix user registration times with interaction logs
    users.forEach(u => {
      if (!u.created_at) return;
      const date = new Date(u.created_at);
      const h = date.getHours();
      hours[h].interactions++;
    });

    interactions.forEach(i => {
      if (!i.created_at) return;
      const date = new Date(i.created_at);
      const h = date.getHours();
      hours[h].interactions++;
    });

    return hours;
  };

  const ageData = getAgeDistribution();
  const regionData = getRegionDistribution();
  const professionData = getProfessionDistribution();
  const statusData = getStatusDistribution();
  const genderData = getGenderDistribution();
  const activityData = getActivityByHour();

  if (users.length === 0) return null;

  const chartHeight = isMobile ? 220 : 260;
  const pieRadius = isMobile ? 60 : 80;

  return (
    <Card>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
          Dashboard Analítico
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground">Situação Financeira</h3>
            <div style={{ height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={pieRadius}
                    label={isMobile ? false : ({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: isMobile ? 11 : 14 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground">Faixa Etária</h3>
            <div style={{ height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={isMobile ? 10 : 12} />
                  <YAxis allowDecimals={false} fontSize={isMobile ? 10 : 12} width={isMobile ? 25 : 40} />
                  <Tooltip />
                  <Bar dataKey="value" name="Usuários" fill="hsl(215, 71%, 12%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground">Top 10 Estados</h3>
            <div style={{ height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} fontSize={isMobile ? 10 : 12} />
                  <YAxis type="category" dataKey="name" fontSize={isMobile ? 10 : 12} width={isMobile ? 30 : 40} />
                  <Tooltip />
                  <Bar dataKey="value" name="Usuários" fill="hsl(38, 68%, 56%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground">Profissões</h3>
            <div style={{ height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={professionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={pieRadius}
                    label={isMobile ? false : ({ name, value }) => `${name}: ${value}`}>
                    {professionData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: isMobile ? 11 : 14 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground">Distribuição por Sexo</h3>
            <div style={{ height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={pieRadius}
                    label={isMobile ? false : ({ name, value }) => `${name}: ${value}`}>
                    {genderData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: isMobile ? 11 : 14 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground">Horários de Maior Atividade (24h)</h3>
            <div style={{ height: chartHeight + 40 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(215, 71%, 12%)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(215, 71%, 12%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground) / 0.1)" />
                  <XAxis dataKey="hour" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="interactions" 
                    stroke="hsl(215, 71%, 12%)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorInteractions)" 
                    name="Interações"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
