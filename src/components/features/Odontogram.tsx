import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { clinicalRecords } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { ToothCondition } from '@/types';
import { Save } from 'lucide-react';

interface OdontogramProps {
  patientId: string;
}

const ADULT_TEETH = [
  [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
  [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
];

const CONDITION_COLORS: Record<string, string> = {
  'healthy': 'bg-white',
  'cavity': 'bg-red-500',
  'restoration': 'bg-blue-500',
  'implant': 'bg-purple-500',
  'extraction': 'bg-gray-400',
  'root-canal': 'bg-orange-500',
  'crown': 'bg-yellow-500',
};

const CONDITION_LABELS: Record<string, string> = {
  'healthy': 'Saudável',
  'cavity': 'Cárie',
  'restoration': 'Restauração',
  'implant': 'Implante',
  'extraction': 'Extração',
  'root-canal': 'Canal',
  'crown': 'Coroa',
};

export default function Odontogram({ patientId }: OdontogramProps) {
  const [teethData, setTeethData] = useState<ToothCondition[]>([]);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  useEffect(() => {
    const record = clinicalRecords.getByPatient(patientId);
    if (record?.odontogram) {
      setTeethData(record.odontogram);
    } else {
      // Initialize with healthy teeth
      const initialData = [...ADULT_TEETH[0], ...ADULT_TEETH[1]].map(num => ({
        toothNumber: num,
        conditions: ['healthy' as const],
        notes: '',
      }));
      setTeethData(initialData);
    }
  }, [patientId]);

  const getToothData = (toothNumber: number): ToothCondition => {
    return teethData.find(t => t.toothNumber === toothNumber) || {
      toothNumber,
      conditions: ['healthy'],
      notes: '',
    };
  };

  const handleToothClick = (toothNumber: number) => {
    setSelectedTooth(toothNumber);
  };

  const handleConditionToggle = (condition: ToothCondition['conditions'][number]) => {
    if (!selectedTooth) return;

    setTeethData(prev => {
      const toothIndex = prev.findIndex(t => t.toothNumber === selectedTooth);
      const currentTooth = toothIndex >= 0 ? prev[toothIndex] : { toothNumber: selectedTooth, conditions: ['healthy' as const], notes: '' };
      
      let newConditions = [...currentTooth.conditions];
      
      if (condition === 'healthy') {
        newConditions = ['healthy'];
      } else {
        newConditions = newConditions.filter(c => c !== 'healthy');
        if (newConditions.includes(condition)) {
          newConditions = newConditions.filter(c => c !== condition);
        } else {
          newConditions.push(condition);
        }
        if (newConditions.length === 0) {
          newConditions = ['healthy'];
        }
      }

      const updatedTooth = { ...currentTooth, conditions: newConditions };

      if (toothIndex >= 0) {
        const newData = [...prev];
        newData[toothIndex] = updatedTooth;
        return newData;
      } else {
        return [...prev, updatedTooth];
      }
    });
  };

  const handleSave = () => {
    const existingRecord = clinicalRecords.getByPatient(patientId);
    
    if (existingRecord) {
      clinicalRecords.update(existingRecord.id, {
        odontogram: teethData,
      });
    } else {
      clinicalRecords.add({
        id: generateId(),
        patientId,
        date: new Date().toISOString(),
        dentistId: '2',
        odontogram: teethData,
        evolution: [],
      });
    }
    
    alert('Odontograma salvo com sucesso!');
  };

  const selectedToothData = selectedTooth ? getToothData(selectedTooth) : null;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {ADULT_TEETH.map((row, idx) => (
          <div key={idx} className="flex justify-center gap-2">
            {row.map((toothNumber) => {
              const toothData = getToothData(toothNumber);
              const primaryCondition = toothData.conditions[0];
              
              return (
                <button
                  key={toothNumber}
                  onClick={() => handleToothClick(toothNumber)}
                  className={`
                    flex h-12 w-12 flex-col items-center justify-center rounded-lg border-2 
                    transition-all hover:scale-110
                    ${selectedTooth === toothNumber ? 'border-primary shadow-lg' : 'border-gray-300'}
                    ${CONDITION_COLORS[primaryCondition]}
                  `}
                >
                  <span className={`text-xs font-bold ${primaryCondition === 'healthy' ? 'text-gray-700' : 'text-white'}`}>
                    {toothNumber}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {selectedToothData && (
        <div className="rounded-lg border bg-muted/30 p-6">
          <h3 className="text-lg font-semibold mb-4">
            Dente {selectedTooth} - Condições
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CONDITION_LABELS).map(([key, label]) => (
              <Badge
                key={key}
                variant={selectedToothData.conditions.includes(key as any) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => handleConditionToggle(key as any)}
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex flex-wrap gap-3 text-sm">
          {Object.entries(CONDITION_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`h-4 w-4 rounded ${CONDITION_COLORS[key]} border`} />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <Button onClick={handleSave} className="ml-auto">
          <Save className="mr-2 h-4 w-4" />
          Salvar Odontograma
        </Button>
      </div>
    </div>
  );
}
