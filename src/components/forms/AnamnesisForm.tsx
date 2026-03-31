import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { AlertCircle, Save } from 'lucide-react';
import { Anamnesis } from '@/types';
import { clinicalRecords } from '@/lib/storage';
import { generateId } from '@/lib/utils';

interface AnamnesisFormProps {
  patientId: string;
  initialData?: Anamnesis;
}

export default function AnamnesisForm({ patientId, initialData }: AnamnesisFormProps) {
  const [formData, setFormData] = useState<Anamnesis>(
    initialData || {
      hasDiabetes: false,
      hasHeartProblems: false,
      hasAllergies: false,
      allergiesList: [],
      currentMedications: [],
      hasSurgeryHistory: false,
      surgeryHistory: '',
      hasBleedingDisorder: false,
      isPregnant: false,
      isSmoker: false,
      alcoholConsumption: false,
      otherConditions: '',
      lastUpdate: new Date().toISOString(),
    }
  );

  const [allergiesInput, setAllergiesInput] = useState('');
  const [medicationsInput, setMedicationsInput] = useState('');

  const handleSave = () => {
    const record = clinicalRecords.getByPatient(patientId);
    
    const updatedData = {
      ...formData,
      allergiesList: allergiesInput.split(',').map(a => a.trim()).filter(Boolean),
      currentMedications: medicationsInput.split(',').map(m => m.trim()).filter(Boolean),
      lastUpdate: new Date().toISOString(),
    };

    if (record) {
      clinicalRecords.update(record.id, {
        anamnesis: updatedData,
      });
    } else {
      clinicalRecords.add({
        id: generateId(),
        patientId,
        date: new Date().toISOString(),
        dentistId: localStorage.getItem('currentUserId') || 'admin',
        anamnesis: updatedData,
        odontogram: [],
        evolution: [],
      });
    }

    alert('Anamnese salva com sucesso!');
  };

  const hasRiskFactors = formData.hasDiabetes || formData.hasHeartProblems || formData.hasBleedingDisorder;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Anamnese Completa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasRiskFactors && (
          <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-900 mb-1">Atenção - Fatores de Risco</h4>
                <p className="text-sm text-orange-700">
                  Paciente possui condições que requerem atenção especial durante procedimentos odontológicos.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Condições de Saúde</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="diabetes"
                checked={formData.hasDiabetes}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, hasDiabetes: checked as boolean })
                }
              />
              <Label htmlFor="diabetes" className="cursor-pointer">
                Possui diabetes
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="heartProblems"
                checked={formData.hasHeartProblems}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, hasHeartProblems: checked as boolean })
                }
              />
              <Label htmlFor="heartProblems" className="cursor-pointer">
                Possui problemas cardíacos
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="bleedingDisorder"
                checked={formData.hasBleedingDisorder}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, hasBleedingDisorder: checked as boolean })
                }
              />
              <Label htmlFor="bleedingDisorder" className="cursor-pointer">
                Possui distúrbios de coagulação
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="pregnant"
                checked={formData.isPregnant}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, isPregnant: checked as boolean })
                }
              />
              <Label htmlFor="pregnant" className="cursor-pointer">
                Está grávida
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="smoker"
                checked={formData.isSmoker}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, isSmoker: checked as boolean })
                }
              />
              <Label htmlFor="smoker" className="cursor-pointer">
                Fumante
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="alcohol"
                checked={formData.alcoholConsumption}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, alcoholConsumption: checked as boolean })
                }
              />
              <Label htmlFor="alcohol" className="cursor-pointer">
                Consome bebidas alcoólicas
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Alergias e Medicamentos</h3>
          
          <div className="space-y-2">
            <Label htmlFor="allergies">Alergias (separe por vírgula)</Label>
            <Input
              id="allergies"
              value={allergiesInput}
              onChange={(e) => setAllergiesInput(e.target.value)}
              placeholder="Ex: Penicilina, Látex, Anestésicos"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medications">Medicamentos em Uso (separe por vírgula)</Label>
            <Input
              id="medications"
              value={medicationsInput}
              onChange={(e) => setMedicationsInput(e.target.value)}
              placeholder="Ex: Losartana, Metformina, Anticoagulantes"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Histórico Cirúrgico</h3>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="surgeryHistory"
              checked={formData.hasSurgeryHistory}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, hasSurgeryHistory: checked as boolean })
              }
            />
            <Label htmlFor="surgeryHistory" className="cursor-pointer">
              Já passou por cirurgias
            </Label>
          </div>

          {formData.hasSurgeryHistory && (
            <div className="space-y-2">
              <Label htmlFor="surgeryDetails">Descreva as cirurgias realizadas</Label>
              <Textarea
                id="surgeryDetails"
                value={formData.surgeryHistory}
                onChange={(e) => setFormData({ ...formData, surgeryHistory: e.target.value })}
                placeholder="Descreva o tipo de cirurgia, data aproximada e observações relevantes"
                rows={3}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="otherConditions">Outras Condições ou Observações</Label>
          <Textarea
            id="otherConditions"
            value={formData.otherConditions}
            onChange={(e) => setFormData({ ...formData, otherConditions: e.target.value })}
            placeholder="Outras informações médicas relevantes"
            rows={4}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} size="lg">
            <Save className="mr-2 h-5 w-5" />
            Salvar Anamnese
          </Button>
        </div>

        {initialData && (
          <p className="text-xs text-muted-foreground text-right">
            Última atualização: {new Date(initialData.lastUpdate).toLocaleString('pt-BR')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
