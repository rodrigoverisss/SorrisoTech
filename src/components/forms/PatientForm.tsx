import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { patients, customFields } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { Patient, CustomFieldValue } from '@/types';
import { X } from 'lucide-react';
import CustomFieldsRenderer from '@/components/features/CustomFieldsRenderer';

interface PatientFormProps {
  patient?: Patient;
  onClose: () => void;
}

export default function PatientForm({ patient, onClose }: PatientFormProps) {
  const [formData, setFormData] = useState<Partial<Patient>>(
    patient || {
      name: '',
      cpf: '',
      rg: '',
      birthDate: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
      },
      medicalInfo: {
        allergies: [],
        diseases: [],
        medications: [],
        medicalHistory: '',
      },
      documents: [],
      customFields: [],
    }
  );

  const patientCustomFields = customFields.getByEntity('patient');

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    const existing = formData.customFields || [];
    const updated = existing.filter((f) => f.fieldId !== fieldId);
    updated.push({ fieldId, value });
    setFormData({ ...formData, customFields: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const patientData: Patient = {
      id: patient?.id || generateId(),
      name: formData.name!,
      cpf: formData.cpf!,
      rg: formData.rg,
      birthDate: formData.birthDate!,
      phone: formData.phone!,
      whatsapp: formData.whatsapp,
      email: formData.email,
      address: formData.address!,
      medicalInfo: formData.medicalInfo!,
      documents: formData.documents || [],
      createdAt: patient?.createdAt || new Date().toISOString(),
    };

    if (patient) {
      patients.update(patient.id, patientData);
    } else {
      patients.add(patientData);
    }

    onClose();
    window.location.reload();
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{patient ? 'Editar Paciente' : 'Novo Paciente'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dados Pessoais</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rg">RG</Label>
                <Input
                  id="rg"
                  value={formData.rg}
                  onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Endereço</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  value={formData.address?.zipCode}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address!, zipCode: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="street">Rua</Label>
                <Input
                  id="street"
                  value={formData.address?.street}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address!, street: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={formData.address?.number}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address!, number: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  value={formData.address?.neighborhood}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address!, neighborhood: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.address?.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address!, city: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.address?.state}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address!, state: e.target.value }
                  })}
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* Informações Médicas */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Informações Médicas</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medicalHistory">Histórico Médico</Label>
                <Textarea
                  id="medicalHistory"
                  value={formData.medicalInfo?.medicalHistory}
                  onChange={(e) => setFormData({
                    ...formData,
                    medicalInfo: { ...formData.medicalInfo!, medicalHistory: e.target.value }
                  })}
                  rows={4}
                  placeholder="Descreva condições médicas, cirurgias anteriores, etc."
                />
              </div>
            </div>
          </div>

          {patientCustomFields.length > 0 && (
            <div>
              <CustomFieldsRenderer
                fields={patientCustomFields}
                values={formData.customFields || []}
                onChange={handleCustomFieldChange}
              />
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {patient ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
