import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { patients } from '@/lib/storage';
import { formatCPF, formatPhone } from '@/lib/utils';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import PatientForm from '@/components/forms/PatientForm';
import { Patient } from '@/types';

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  const allPatients = patients.getAll();
  const filteredPatients = allPatients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cpf.includes(searchTerm)
  );

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este paciente?')) {
      patients.delete(id);
      window.location.reload();
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedPatient(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground">Gerencie o cadastro de pacientes</p>
        </div>
        <Button onClick={() => setShowForm(true)} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Novo Paciente
        </Button>
      </div>

      {showForm && (
        <PatientForm 
          patient={selectedPatient || undefined} 
          onClose={handleCloseForm}
        />
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold">Nome</th>
                  <th className="p-3 text-left text-sm font-semibold">CPF</th>
                  <th className="p-3 text-left text-sm font-semibold">Telefone</th>
                  <th className="p-3 text-left text-sm font-semibold">Email</th>
                  <th className="p-3 text-right text-sm font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                            {patient.name.charAt(0)}
                          </div>
                          <span className="font-medium">{patient.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">{formatCPF(patient.cpf)}</td>
                      <td className="p-3 text-sm">{formatPhone(patient.phone)}</td>
                      <td className="p-3 text-sm">{patient.email || '-'}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(patient)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(patient.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Nenhum paciente encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
