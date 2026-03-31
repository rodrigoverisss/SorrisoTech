import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { patients, clinicalRecords, customFields } from '@/lib/storage';
import { FileText, User } from 'lucide-react';
import Odontogram from '@/components/features/Odontogram';
import AnamnesisForm from '@/components/forms/AnamnesisForm';
import CustomFieldsRenderer from '@/components/features/CustomFieldsRenderer';
import { CustomFieldValue } from '@/types';
import { Button } from '@/components/ui/button';
import { clinicalRecords as records } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

export default function Records() {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [customFieldValues, setCustomFieldValues] = useState<CustomFieldValue[]>([]);
  const allPatients = patients.getAll();
  const selectedPatient = selectedPatientId ? patients.getById(selectedPatientId) : null;
  const patientRecord = selectedPatientId ? clinicalRecords.getByPatient(selectedPatientId) : null;
  const recordCustomFields = customFields.getByEntity('record');

  const handlePatientChange = (id: string) => {
    setSelectedPatientId(id);
    const rec = clinicalRecords.getByPatient(id);
    setCustomFieldValues(rec?.customFields || []);
  };

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    const updated = customFieldValues.filter((f) => f.fieldId !== fieldId);
    updated.push({ fieldId, value });
    setCustomFieldValues(updated);
  };

  const saveCustomFields = () => {
    if (!selectedPatientId) return;
    const rec = clinicalRecords.getByPatient(selectedPatientId);
    if (rec) {
      records.update(rec.id, { customFields: customFieldValues });
    } else {
      records.add({
        id: generateId(),
        patientId: selectedPatientId,
        date: new Date().toISOString().split('T')[0],
        dentistId: '',
        odontogram: [],
        evolution: [],
        customFields: customFieldValues,
      });
    }
    toast.success('Campos personalizados salvos!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Prontuário Odontológico</h1>
        <p className="text-muted-foreground">Visualize e edite o prontuário dos pacientes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Selecionar Paciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedPatientId} onValueChange={handlePatientChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Escolha um paciente" />
            </SelectTrigger>
            <SelectContent>
              {allPatients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name} - {patient.cpf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedPatient ? (
        <>
          <AnamnesisForm 
            patientId={selectedPatient.id} 
            initialData={patientRecord?.anamnesis}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Informações do Paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Nome Completo</p>
                  <p className="font-medium">{selectedPatient.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                  <p className="font-medium">
                    {new Date(selectedPatient.birthDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{selectedPatient.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedPatient.email || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Odontograma Interativo</CardTitle>
            </CardHeader>
            <CardContent>
              <Odontogram patientId={selectedPatient.id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico Médico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm">
                  {selectedPatient.medicalInfo.medicalHistory || 
                    'Nenhum histórico médico registrado'}
                </p>
              </div>
            </CardContent>
          </Card>

          {recordCustomFields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Campos Personalizados do Prontuário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CustomFieldsRenderer
                  fields={recordCustomFields}
                  values={customFieldValues}
                  onChange={handleCustomFieldChange}
                />
                <div className="flex justify-end pt-2">
                  <Button onClick={saveCustomFields}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Campos
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-3" />
              <p>Selecione um paciente para visualizar o prontuário</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
