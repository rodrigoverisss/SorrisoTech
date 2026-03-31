import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { treatments, patients, customFields } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { Treatment } from '@/types';
import { X, Plus, Trash2 } from 'lucide-react';
import CustomFieldsRenderer from '@/components/features/CustomFieldsRenderer';
import { CustomFieldValue } from '@/types';

interface TreatmentFormProps {
  treatment?: Treatment;
  onClose: () => void;
}

export default function TreatmentForm({ treatment, onClose }: TreatmentFormProps) {
  const [formData, setFormData] = useState<Partial<Treatment>>(
    treatment || {
      patientId: '',
      procedures: [],
      totalValue: 0,
      installments: 1,
      status: 'planned',
      startDate: new Date().toISOString().split('T')[0],
      notes: '',
      customFields: [],
    }
  );

  const [currentProcedure, setCurrentProcedure] = useState({ name: '', value: 0 });
  const allPatients = patients.getAll();
  const treatmentCustomFields = customFields.getByEntity('treatment');

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    const existing = formData.customFields || [];
    const updated = existing.filter((f: CustomFieldValue) => f.fieldId !== fieldId);
    updated.push({ fieldId, value });
    setFormData({ ...formData, customFields: updated });
  };

  const addProcedure = () => {
    if (currentProcedure.name && currentProcedure.value > 0) {
      const newProcedures = [...(formData.procedures || []), currentProcedure];
      const total = newProcedures.reduce((sum, p) => sum + p.value, 0);
      setFormData({ 
        ...formData, 
        procedures: newProcedures,
        totalValue: total
      });
      setCurrentProcedure({ name: '', value: 0 });
    }
  };

  const removeProcedure = (index: number) => {
    const newProcedures = formData.procedures?.filter((_, i) => i !== index) || [];
    const total = newProcedures.reduce((sum, p) => sum + p.value, 0);
    setFormData({ 
      ...formData, 
      procedures: newProcedures,
      totalValue: total
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const treatmentData: Treatment = {
      id: treatment?.id || generateId(),
      patientId: formData.patientId!,
      procedures: formData.procedures!,
      totalValue: formData.totalValue!,
      installments: formData.installments!,
      status: formData.status as Treatment['status'],
      startDate: formData.startDate!,
      endDate: formData.endDate,
      notes: formData.notes,
    };

    if (treatment) {
      treatments.update(treatment.id, treatmentData);
    } else {
      treatments.add(treatmentData);
    }

    onClose();
    window.location.reload();
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{treatment ? 'Editar Tratamento' : 'Novo Tratamento'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Treatment['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planejado</SelectItem>
                  <SelectItem value="in-progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="installments">Parcelas *</Label>
              <Input
                id="installments"
                type="number"
                min="1"
                value={formData.installments}
                onChange={(e) => setFormData({ ...formData, installments: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Procedimentos</Label>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-2">
                <Input
                  placeholder="Nome do procedimento"
                  value={currentProcedure.name}
                  onChange={(e) => setCurrentProcedure({ ...currentProcedure, name: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Valor"
                  value={currentProcedure.value || ''}
                  onChange={(e) => setCurrentProcedure({ ...currentProcedure, value: parseFloat(e.target.value) || 0 })}
                />
                <Button type="button" onClick={addProcedure}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {formData.procedures && formData.procedures.length > 0 && (
              <div className="space-y-2">
                {formData.procedures.map((proc, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg bg-muted p-3">
                    <span>{proc.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">R$ {proc.value.toFixed(2)}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProcedure(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">Total:</span>
                  <span className="text-xl font-bold text-primary">R$ {formData.totalValue?.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {treatmentCustomFields.length > 0 && (
            <div className="pt-2">
              <CustomFieldsRenderer
                fields={treatmentCustomFields}
                values={formData.customFields || []}
                onChange={handleCustomFieldChange}
              />
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!formData.procedures || formData.procedures.length === 0}>
              {treatment ? 'Atualizar' : 'Criar Tratamento'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
