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
import { X, UserPlus } from 'lucide-react';

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

  // Paciente avaliação (sem cadastro)
  const [isEvaluation, setIsEvaluation] = useState(
    appointment?.patientId?.startsWith('eval-') || false
  );
  const [evalName, setEvalName] = useState(
    appointment?.patientId?.startsWith('eval-')
      ? appointment.notes?.match(/\[Avaliação: (.+?)\]/)?.[1] || ''
      : ''
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

    // Se for avaliação, gerar ID temporário e registrar nome nas notas
    if (isEvaluation) {
      appointmentData.patientId = `eval-${generateId()}`;
      const baseName = evalName.trim() || 'Avaliação';
      appointmentData.notes = `[Avaliação: ${baseName}]${formData.notes ? ' ' + formData.notes : ''}`;
    }

    const patient = patients.getById(appointmentData.patientId);
    const patientName = isEvaluation
      ? (evalName.trim() || 'Avaliação')
      : patient?.name || 'Paciente';

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
            {/* Toggle paciente cadastrado / avaliação */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 rounded-lg border p-3 bg-gray-50">
                <button
                  type="button"
                  onClick={() => { setIsEvaluation(false); setFormData({ ...formData, patientId: '' }); }}
                  className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                    !isEvaluation ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Paciente Cadastrado
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEvaluation(true); setFormData({ ...formData, patientId: 'eval-temp' }); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-colors ${
                    isEvaluation ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  Paciente Avaliação
                </button>
              </div>
            </div>

            {/* Campo de paciente */}
            <div className="space-y-2">
              {isEvaluation ? (
                <>
                  <Label htmlFor="evalName">Nome do Paciente (Avaliação)</Label>
                  <Input
                    id="evalName"
                    placeholder="Nome completo (opcional)"
                    value={evalName}
                    onChange={(e) => setEvalName(e.target.value)}
                  />
                  <p className="text-xs text-amber-600">Paciente de avaliação — não precisa estar cadastrado.</p>
                </>
              ) : (
                <>
                  <Label htmlFor="patientId">Paciente *</Label>
                  <Select
                    value={formData.patientId}
                    onValueChange={(value) => setFormData({ ...formData, patientId: value })}
                    required={!isEvaluation}
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
                </>
              )}
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

          <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Input
                id="notes"
                placeholder="Observações adicionais"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isEvaluation && !formData.patientId}
            >
              {appointment ? 'Atualizar' : 'Agendar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
