import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { appointments, patients } from '@/lib/storage';
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import AppointmentForm from '@/components/forms/AppointmentForm';
import WeeklyCalendar from '@/components/features/WeeklyCalendar';
import MonthlyCalendar from '@/components/features/MonthlyCalendar';
import { Appointment } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_COLORS = {
  'scheduled': 'bg-blue-100 text-blue-700',
  'confirmed': 'bg-green-100 text-green-700',
  'in-progress': 'bg-yellow-100 text-yellow-700',
  'completed': 'bg-gray-100 text-gray-700',
  'cancelled': 'bg-red-100 text-red-700',
};

const STATUS_LABELS = {
  'scheduled': 'Agendado',
  'confirmed': 'Confirmado',
  'in-progress': 'Em Atendimento',
  'completed': 'Finalizado',
  'cancelled': 'Cancelado',
};

export default function Schedule() {
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const dateStr = selectedDate.toISOString().split('T')[0];
  const dayAppointments = appointments.getByDate(dateStr).sort((a, b) => a.time.localeCompare(b.time));

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">Gerencie os agendamentos</p>
        </div>
        <Button onClick={() => setShowForm(true)} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Nova Consulta
        </Button>
      </div>

      {showForm && (
        <AppointmentForm 
          appointment={selectedAppointment || undefined}
          onClose={handleCloseForm}
        />
      )}

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="daily">Diária</TabsTrigger>
          <TabsTrigger value="weekly">Semanal</TabsTrigger>
          <TabsTrigger value="monthly">Mensal</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Consultas do Dia
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Hoje
              </Button>
              <span className="font-semibold min-w-[140px] text-center">
                {selectedDate.toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: 'long',
                  year: 'numeric' 
                })}
              </span>
              <Button variant="outline" size="sm" onClick={handleNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {dayAppointments.length > 0 ? (
            <div className="space-y-3">
              {dayAppointments.map((apt) => {
                const patient = patients.getById(apt.patientId);
                return (
                  <div 
                    key={apt.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <span className="text-2xl font-bold">{apt.time.split(':')[0]}</span>
                        <span className="text-xs">{apt.time.split(':')[1]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{patient?.name || 'Paciente não encontrado'}</p>
                        <p className="text-sm text-muted-foreground">{apt.procedureType}</p>
                        <p className="text-xs text-muted-foreground mt-1">Duração: {apt.duration} min</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium',
                        STATUS_COLORS[apt.status]
                      )}>
                        {STATUS_LABELS[apt.status]}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedAppointment(apt);
                        setShowForm(true);
                      }}>
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Nenhuma consulta agendada para este dia
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => setShowForm(true)}
              >
                Agendar Consulta
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Visualização Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyCalendar
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onAppointmentClick={(apt) => {
                  setSelectedAppointment(apt);
                  setShowForm(true);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Visualização Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyCalendar
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onAppointmentClick={(apt) => {
                  setSelectedAppointment(apt);
                  setShowForm(true);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
