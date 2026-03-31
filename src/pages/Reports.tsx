import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Download, FileText, Calendar, Users, DollarSign } from 'lucide-react';
import { useState } from 'react';

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const reports = [
    {
      title: 'Faturamento Mensal',
      description: 'Relatório completo de receitas e despesas do mês',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Pacientes Atendidos',
      description: 'Lista de pacientes atendidos no período',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Agenda Ocupada',
      description: 'Taxa de ocupação da agenda por profissional',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Procedimentos Realizados',
      description: 'Procedimentos mais realizados no período',
      icon: BarChart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground">Análises e relatórios gerenciais da clínica</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filtrar Período</CardTitle>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="quarter">Este Trimestre</SelectItem>
                <SelectItem value="year">Este Ano</SelectItem>
                <SelectItem value="custom">Período Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {reports.map((report, index) => {
          const Icon = report.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${report.bgColor}`}>
                    <Icon className={`h-6 w-6 ${report.color}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <FileText className="mr-2 h-4 w-4" />
                    Visualizar
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo Executivo - {selectedPeriod === 'month' ? 'Este Mês' : 'Período Selecionado'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Total de Consultas</p>
              <p className="text-3xl font-bold mt-2">124</p>
              <p className="text-sm text-green-600 mt-1">+12% vs mês anterior</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Faturamento Total</p>
              <p className="text-3xl font-bold mt-2">R$ 45.890</p>
              <p className="text-sm text-green-600 mt-1">+8% vs mês anterior</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Taxa de Comparecimento</p>
              <p className="text-3xl font-bold mt-2">87%</p>
              <p className="text-sm text-orange-600 mt-1">-3% vs mês anterior</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <BarChart className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Relatórios Personalizados</h3>
              <p className="text-sm text-blue-700">
                Você pode criar relatórios personalizados com os dados específicos que precisa. 
                Acesse as Configurações do sistema para definir novos modelos de relatórios.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
