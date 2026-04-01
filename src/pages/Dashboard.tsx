import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { patients, appointments, transactions } from '@/lib/storage';
import { formatCurrency } from '@/lib/utils';
import { Users, Calendar, TrendingUp, Clock, AlertCircle, Activity } from 'lucide-react';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const allPatients = patients.getAll();
  const allAppointments = appointments.getAll();
  const allTransactions = transactions.getAll();

  const today = new Date().toISOString().split('T')[0];
  
  const stats = useMemo(() => {
    const todayAppointments = allAppointments.filter(a => a.date === today);

    const upcomingAppointments = allAppointments
      .filter(a => a.status !== 'cancelled' && new Date(a.date + 'T' + a.time) > new Date())
      .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())
      .slice(0, 5);

    // Procedimentos mais realizados
    const procedureCounts: Record<string, number> = {};
    allAppointments.forEach(apt => {
      procedureCounts[apt.procedureType] = (procedureCounts[apt.procedureType] || 0) + 1;
    });
    const procedureData = Object.entries(procedureCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Consultas por dentista
    const dentistCounts: Record<string, number> = {};
    allAppointments.forEach(apt => {
      const dentistName = apt.dentistId === 'dentist1' ? 'Dr. Silva' : 'Dra. Santos';
      dentistCounts[dentistName] = (dentistCounts[dentistName] || 0) + 1;
    });
    const dentistData = Object.entries(dentistCounts).map(([name, consultas]) => ({ name, consultas }));

    // Evolução mensal (últimos 6 meses)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toLocaleDateString('pt-BR', { month: 'short' });
      
      const monthTransactions = allTransactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === date.getMonth() && 
               tDate.getFullYear() === date.getFullYear() &&
               t.type === 'income';
      });
      
      const monthAppointments = allAppointments.filter(a => {
        const aDate = new Date(a.date);
        return aDate.getMonth() === date.getMonth() && 
               aDate.getFullYear() === date.getFullYear();
      });
      
      const revenue = monthTransactions.reduce((sum, t) => sum + t.value, 0);
      const completed = monthAppointments.filter(a => a.status === 'completed').length;
      const attendance = monthAppointments.length > 0 
        ? Math.round((completed / monthAppointments.length) * 100) 
        : 0;
      
      monthlyData.push({
        month: monthStr,
        faturamento: revenue,
        comparecimento: attendance,
      });
    }

    return {
      totalPatients: allPatients.length,
      todayAppointments: todayAppointments.length,
      upcomingAppointments,
      procedureData,
      dentistData,
      monthlyData,
    };
  }, [allPatients, allAppointments, allTransactions, today]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua clínica</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Pacientes
            </CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Consultas Hoje
            </CardTitle>
            <Calendar className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Agendadas para hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Procedimentos Realizados
            </CardTitle>
            <Activity className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{allAppointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de consultas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Procedimentos Mais Realizados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.procedureData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.procedureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consultas por Dentista</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.dentistData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="consultas" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolução Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="faturamento" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Faturamento (R$)"
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="comparecimento" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Taxa de Comparecimento (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Próximos Atendimentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Próximos Atendimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {stats.upcomingAppointments.map((apt) => {
                  const patient = patients.getById(apt.patientId);
                  // Nome para avaliações (patientId começa com 'eval-')
                  const evalName = apt.notes?.match(/\[Avaliação: (.+?)\]/)?.[1];
                  const displayName = apt.patientId?.startsWith('eval-')
                    ? (evalName || 'Avaliação')
                    : patient?.name || 'Paciente não encontrado';
                  return (
                    <div key={apt.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{displayName}</p>
                          {apt.patientId?.startsWith('eval-') && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Avaliação</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{apt.procedureType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{apt.time}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(apt.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nenhum atendimento agendado
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-left transition-colors hover:border-primary hover:bg-primary/5">
              <p className="font-medium">Novo Paciente</p>
              <p className="text-sm text-muted-foreground">Cadastrar novo paciente no sistema</p>
            </button>
            <button className="w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-left transition-colors hover:border-primary hover:bg-primary/5">
              <p className="font-medium">Agendar Consulta</p>
              <p className="text-sm text-muted-foreground">Marcar nova consulta na agenda</p>
            </button>
            <button className="w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-left transition-colors hover:border-primary hover:bg-primary/5">
              <p className="font-medium">Registrar Atendimento</p>
              <p className="text-sm text-muted-foreground">Preencher prontuário do paciente</p>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
