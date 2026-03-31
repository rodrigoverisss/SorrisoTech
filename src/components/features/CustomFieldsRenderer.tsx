import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomField, CustomFieldValue } from '@/types';

interface CustomFieldsRendererProps {
  fields: CustomField[];
  values: CustomFieldValue[];
  onChange: (fieldId: string, value: any) => void;
}

export default function CustomFieldsRenderer({ fields, values, onChange }: CustomFieldsRendererProps) {
  const getValue = (fieldId: string) => {
    return values.find(v => v.fieldId === fieldId)?.value || '';
  };

  if (fields.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Campos Personalizados</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => {
          const value = getValue(field.id);

          switch (field.type) {
            case 'text':
              return (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.label} {field.required && '*'}
                  </Label>
                  <Input
                    id={field.id}
                    value={value}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    required={field.required}
                  />
                </div>
              );

            case 'number':
              return (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.label} {field.required && '*'}
                  </Label>
                  <Input
                    id={field.id}
                    type="number"
                    value={value}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    required={field.required}
                  />
                </div>
              );

            case 'date':
              return (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.label} {field.required && '*'}
                  </Label>
                  <Input
                    id={field.id}
                    type="date"
                    value={value}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    required={field.required}
                  />
                </div>
              );

            case 'select':
              return (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.label} {field.required && '*'}
                  </Label>
                  <Select value={value} onValueChange={(v) => onChange(field.id, v)} required={field.required}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );

            case 'multiselect':
              return (
                <div key={field.id} className="space-y-2">
                  <Label>{field.label} {field.required && '*'}</Label>
                  <div className="space-y-2">
                    {field.options?.map((option) => {
                      const isChecked = Array.isArray(value) && value.includes(option);
                      return (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${field.id}-${option}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const currentValues = Array.isArray(value) ? value : [];
                              const newValues = checked
                                ? [...currentValues, option]
                                : currentValues.filter(v => v !== option);
                              onChange(field.id, newValues);
                            }}
                          />
                          <Label htmlFor={`${field.id}-${option}`} className="cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
