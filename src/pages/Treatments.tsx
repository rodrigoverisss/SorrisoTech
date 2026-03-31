import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { treatments, patients } from '@/lib/storage';
import { formatCurrency } from '@/lib/utils';
import { Plus, Search, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import TreatmentForm from '@/components/forms/TreatmentForm';
import { Treatment } from '@/types';

export default function Treatments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  
  const allTreatments = treatments.getAll();
  const filteredTreatments = allTreatments.filter(t => {
    const patient = patients.getById(t.patientId);
    return patient?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusIcon = (status: Treatment['status']) => {
    switch (status) {
      case 'planned':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'in-progress':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const getStatusText = (status: Treatment['status']) => {
    switch (status) {
      case 'planned':
        return 'Planejado';
      case 'in-progress':
        return 'Em Andamento';
      case 'completed':
        return 'Concluído';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tratamentos</h1>
          <p className="text-muted-foreground">Gerencie os planos de tratamento dos pacientes</p>
        </div>
        <Button onClick={() => setShowForm(true)} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Novo Tratamento
        </Button>
      </div>

      {showForm && (
        <TreatmentForm 
          treatment={selectedTreatment || undefined} 
          onClose={() => {
            setShowForm(false);
            setSelectedTreatment(null);
          }}
        />
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTreatments.length > 0 ? (
              filteredTreatments.map((treatment) => {
                const patient = patients.getById(treatment.patientId);
                return (
                  <Card key={treatment.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{patient?.name || 'Paciente não encontrado'}</h3>
                            <p className="text-sm text-muted-foreground">
                              Início: {new Date(treatment.startDate).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(treatment.status)}
                          <span className="text-sm font-medium">{getStatusText(treatment.status)}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Procedimentos:</h4>
                        <div className="grid gap-2">
                          {treatment.procedures.map((proc, index) => (
                            <div key={index} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                              <span className="text-sm">{proc.name}</span>
                              <span className="font-medium">{formatCurrency(proc.value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Valor Total</p>
                          <p className="text-2xl font-bold text-primary">{formatCurrency(treatment.totalValue)}</p>
                        </div>
                        {treatment.installments > 1 && (
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Parcelamento</p>
                            <p className="font-medium">{treatment.installments}x de {formatCurrency(treatment.totalValue / treatment.installments)}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-3" />
                <p>Nenhum tratamento encontrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
