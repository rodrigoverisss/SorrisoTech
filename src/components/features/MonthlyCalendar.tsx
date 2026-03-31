import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { appointments, patients } from '@/lib/storage';
import { Appointment } from '@/types';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthlyCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onAppointmentClick: (apt: Appointment) => void;
}

export default function MonthlyCalendar({ selectedDate, onDateChange, onAppointmentClick }: MonthlyCalendarProps) {
  const monthDays = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return { days, currentMonth: month };
  }, [selectedDate]);

  const allAppointments = appointments.getAll();

  const handlePrevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const getAppointmentsForDay = (day: Date) => {
    const dateStr = day.toISOString().split('T')[0];
    return allAppointments.filter(apt => apt.date === dateStr);
  };

  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === monthDays.currentMonth;
  };

  const isToday = (day: Date) => {
    const today = new Date();
    return day.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold min-w-[200px] text-center">
            {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="p-2 text-center font-semibold text-sm">
            {day}
          </div>
        ))}

        {monthDays.days.map((day, idx) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isCurrent = isCurrentMonth(day);
          const isNow = isToday(day);

          return (
            <Card
              key={idx}
              className={cn(
                'min-h-[100px] p-2 hover:bg-muted/50 transition-colors',
                !isCurrent && 'bg-muted/30 opacity-50'
              )}
            >
              <div
                className={cn(
                  'text-sm font-semibold mb-1',
                  isNow && 'flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white'
                )}
              >
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map(apt => {
                  const patient = patients.getById(apt.patientId);
                  return (
                    <div
                      key={apt.id}
                      onClick={() => onAppointmentClick(apt)}
                      className="text-xs p-1 rounded bg-primary/10 hover:bg-primary/20 cursor-pointer truncate"
                    >
                      <div className="font-medium truncate">{apt.time} {patient?.name}</div>
                    </div>
                  );
                })}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{dayAppointments.length - 3} mais
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
