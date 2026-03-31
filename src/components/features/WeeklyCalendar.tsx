import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { appointments, patients } from '@/lib/storage';
import { Appointment } from '@/types';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeeklyCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onAppointmentClick: (apt: Appointment) => void;
}

const PROCEDURE_COLORS: Record<string, string> = {
  'Limpeza': 'bg-blue-500',
  'Restauração': 'bg-green-500',
  'Canal': 'bg-red-500',
  'Extração': 'bg-orange-500',
  'Implante': 'bg-purple-500',
  'Ortodontia': 'bg-pink-500',
  'default': 'bg-gray-500',
};

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8h às 19h

export default function WeeklyCalendar({ selectedDate, onDateChange, onAppointmentClick }: WeeklyCalendarProps) {
  const [filterDentist, setFilterDentist] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const weekDays = useMemo(() => {
    const days = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, [selectedDate]);

  const allAppointments = appointments.getAll();

  const filteredAppointments = useMemo(() => {
    return allAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const isInWeek = weekDays.some(day => 
        day.toISOString().split('T')[0] === apt.date
      );
      
      const matchesDentist = filterDentist === 'all' || apt.dentistId === filterDentist;
      const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
      
      return isInWeek && matchesDentist && matchesStatus;
    });
  }, [allAppointments, weekDays, filterDentist, filterStatus]);

  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    onDateChange(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    onDateChange(newDate);
  };

  const getAppointmentsForSlot = (day: Date, hour: number) => {
    const dateStr = day.toISOString().split('T')[0];
    return filteredAppointments.filter(apt => {
      if (apt.date !== dateStr) return false;
      const aptHour = parseInt(apt.time.split(':')[0]);
      return aptHour === hour;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold min-w-[200px] text-center">
            {weekDays[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - {weekDays[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          <Button variant="outline" size="sm" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="scheduled">Agendado</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="in-progress">Em Atendimento</SelectItem>
              <SelectItem value="completed">Finalizado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterDentist} onValueChange={setFilterDentist}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Dentistas</SelectItem>
              <SelectItem value="dentist1">Dr. Silva</SelectItem>
              <SelectItem value="dentist2">Dra. Santos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          <div className="grid grid-cols-8 gap-2">
            <div className="p-2 font-semibold text-sm">Horário</div>
            {weekDays.map((day, idx) => (
              <div key={idx} className="p-2 text-center">
                <div className="font-semibold">
                  {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {day.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {HOURS.map(hour => (
              <div key={hour} className="grid grid-cols-8 gap-2">
                <div className="p-2 text-sm font-medium text-muted-foreground">
                  {hour}:00
                </div>
                {weekDays.map((day, idx) => {
                  const aptsInSlot = getAppointmentsForSlot(day, hour);
                  return (
                    <Card 
                      key={idx} 
                      className="p-1 min-h-[60px] hover:bg-muted/50 transition-colors"
                    >
                      {aptsInSlot.map(apt => {
                        const patient = patients.getById(apt.patientId);
                        const color = PROCEDURE_COLORS[apt.procedureType] || PROCEDURE_COLORS.default;
                        return (
                          <div
                            key={apt.id}
                            onClick={() => onAppointmentClick(apt)}
                            className={cn(
                              'text-xs p-1.5 rounded mb-1 cursor-pointer text-white',
                              color
                            )}
                          >
                            <div className="font-semibold truncate">{patient?.name}</div>
                            <div className="truncate opacity-90">{apt.procedureType}</div>
                          </div>
                        );
                      })}
                    </Card>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        {Object.entries(PROCEDURE_COLORS).filter(([key]) => key !== 'default').map(([name, color]) => (
          <div key={name} className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded', color)} />
            <span className="text-sm">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
