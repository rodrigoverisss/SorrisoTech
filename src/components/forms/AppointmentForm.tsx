import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { appointments, patients } from '@/lib/storage';
import { logAction } from '@/lib/audit';
import { generateId } from '@/lib/utils';
import { Appointment } from '@/types';
import { X } from 'lucide-react';

interface AppointmentFormProps {
  appointment?: Appointment;
  onClose: () => void;
}

export default function AppointmentForm({ appointment, onClose }: AppointmentFormProps) {
  const [formData, setFormData] = useState<Partial<Appointment>>(
    appointment || {
      patientId: '',
      dentistId: '2',
      date: '',
      time: '',
      duration: 60,
      status: 'scheduled',
      procedureType: '',
      notes: '',
    }
  );

  const allPatients = patients.getAll();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const appointmentData: Appointment = {
      id: appointment?.id || generateId(),
      patientId: formData.patientId!,
      dentistId: formData.dentistId!,
      date: formData.date!,
      time: formData.time!,
      duration: formData.duration!,
      status: formData.status as Appointment['status'],
      procedureType: formData.procedureType!,
      notes: formData.notes,
    };

    const patient = patients.getById(appointmentData.patientId);
    const patientName = patient?.name || 'Paciente';

    if (appointment) {
      appointments.update(appointment.id, appointmentData);
      logAction('update', 'appointment', appointment.id, patientName, `Consulta atualizada: ${appointmentData.procedureType} em ${new Date(appointmentData.date).toLocaleDateString('pt-BR')}`);
    } else {
      appointments.add(appointmentData);
      logAction('create', 'appointment', appointmentData.id, patientName, `Consulta agendada: ${appointmentData.procedureType} em ${new Date(appointmentData.date).toLocaleDateString('pt-BR')}`);
    }

    onClose();
    window.location.reload();
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{appointment ? 'Editar Consulta' : 'Nova Consulta'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="patientId">Paciente *</Label>
              <Select
                value={formData.patientId}
                onValueChange={(value) => setFormData({ ...formData, patientId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {allPatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dentistId">Dentista *</Label>
              <Select
                value={formData.dentistId}
                onValueChange={(value) => setFormData({ ...formData, dentistId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dentista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dentist1">Dr. Silva</SelectItem>
                  <SelectItem value="dentist2">Dra. Santos</SelectItem>
                  <SelectItem value="dentist3">Dr. Costa</SelectItem>
                  <SelectItem value="dentist4">Dra. Oliveira</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="procedureType">Tipo de Procedimento *</Label>
              <Select
                value={formData.procedureType}
                onValueChange={(value) => setFormData({ ...formData, procedureType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o procedimento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Limpeza">Limpeza</SelectItem>
                  <SelectItem value="Restauração">Restauração</SelectItem>
                  <SelectItem value="Canal">Canal</SelectItem>
                  <SelectItem value="Extração">Extração</SelectItem>
                  <SelectItem value="Implante">Implante</SelectItem>
                  <SelectItem value="Ortodontia">Ortodontia</SelectItem>
                  <SelectItem value="Clareamento">Clareamento</SelectItem>
                  <SelectItem value="Prótese">Prótese</SelectItem>
                  <SelectItem value="Cirurgia">Cirurgia</SelectItem>
                  <SelectItem value="Avaliação">Avaliação</SelectItem>
                  <SelectItem value="Emergência">Emergência</SelectItem>
                  <SelectItem value="Retorno">Retorno</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Horário *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos) *</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Appointment['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="in-progress">Em Atendimento</SelectItem>
                  <SelectItem value="completed">Finalizado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {appointment ? 'Atualizar' : 'Agendar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
