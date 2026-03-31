import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { customFields } from '@/lib/storage';
import { logAction } from '@/lib/audit';
import { CustomField } from '@/types';
import { generateId } from '@/lib/utils';
import { Plus, Trash2, Edit, Sliders, MoveUp, MoveDown } from 'lucide-react';

export default function CustomFields() {
  const [activeTab, setActiveTab] = useState<'patient' | 'treatment' | 'record'>('patient');
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [formData, setFormData] = useState<Partial<CustomField>>({
    name: '',
    label: '',
    type: 'text',
    required: false,
    entityType: 'patient',
    options: [],
  });
  const [optionsInput, setOptionsInput] = useState('');

  const fields = customFields.getByEntity(activeTab);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fieldData: CustomField = {
      id: editingField?.id || generateId(),
      name: formData.name!,
      label: formData.label!,
      type: formData.type!,
      required: formData.required!,
      entityType: activeTab,
      options: formData.type === 'select' || formData.type === 'multiselect' 
        ? optionsInput.split(',').map(o => o.trim()).filter(Boolean)
        : undefined,
      order: editingField?.order || fields.length,
    };

    if (editingField) {
      customFields.update(editingField.id, fieldData);
      logAction('update', 'patient', editingField.id, fieldData.label, `Campo personalizado "${fieldData.label}" atualizado`);
    } else {
      customFields.add(fieldData);
      logAction('create', 'patient', fieldData.id, fieldData.label, `Campo personalizado "${fieldData.label}" criado`);
    }

    setShowForm(false);
    setEditingField(null);
    setFormData({ name: '', label: '', type: 'text', required: false, entityType: activeTab, options: [] });
    setOptionsInput('');
    window.location.reload();
  };

  const handleEdit = (field: CustomField) => {
    setEditingField(field);
    setFormData(field);
    setOptionsInput(field.options?.join(', ') || '');
    setShowForm(true);
  };

  const handleDelete = (field: CustomField) => {
    if (!confirm(`Tem certeza que deseja excluir o campo "${field.label}"?`)) return;
    
    customFields.delete(field.id);
    logAction('delete', 'patient', field.id, field.label, `Campo personalizado "${field.label}" excluído`);
    window.location.reload();
  };

  const handleMoveUp = (field: CustomField, index: number) => {
    if (index === 0) return;
    const prevField = fields[index - 1];
    customFields.update(field.id, { order: prevField.order });
    customFields.update(prevField.id, { order: field.order });
    window.location.reload();
  };

  const handleMoveDown = (field: CustomField, index: number) => {
    if (index === fields.length - 1) return;
    const nextField = fields[index + 1];
    customFields.update(field.id, { order: nextField.order });
    customFields.update(nextField.id, { order: field.order });
    window.location.reload();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingField(null);
    setFormData({ name: '', label: '', type: 'text', required: false, entityType: activeTab, options: [] });
    setOptionsInput('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campos Personalizados</h1>
          <p className="text-muted-foreground">Configure campos extras para pacientes, tratamentos e prontuários</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-5 w-5" />
          Novo Campo
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{editingField ? 'Editar Campo' : 'Novo Campo'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Campo (ID) *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    placeholder="ex: altura_paciente"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Usado internamente, sem espaços</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="label">Rótulo (Label) *</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="ex: Altura do Paciente"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Exibido no formulário</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Campo *</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="date">Data</SelectItem>
                      <SelectItem value="select">Seleção Única</SelectItem>
                      <SelectItem value="multiselect">Seleção Múltipla</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center justify-between">
                    Campo Obrigatório
                    <Switch
                      checked={formData.required}
                      onCheckedChange={(checked) => setFormData({ ...formData, required: checked })}
                    />
                  </Label>
                </div>
              </div>

              {(formData.type === 'select' || formData.type === 'multiselect') && (
                <div className="space-y-2">
                  <Label htmlFor="options">Opções (separadas por vírgula) *</Label>
                  <Input
                    id="options"
                    value={optionsInput}
                    onChange={(e) => setOptionsInput(e.target.value)}
                    placeholder="Opção 1, Opção 2, Opção 3"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingField ? 'Atualizar' : 'Criar'} Campo
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="patient">Pacientes</TabsTrigger>
          <TabsTrigger value="treatment">Tratamentos</TabsTrigger>
          <TabsTrigger value="record">Prontuários</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary" />
                Campos Configurados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fields.length > 0 ? (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveUp(field, index)}
                            disabled={index === 0}
                            className="h-6 w-6 p-0"
                          >
                            <MoveUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveDown(field, index)}
                            disabled={index === fields.length - 1}
                            className="h-6 w-6 p-0"
                          >
                            <MoveDown className="h-3 w-3" />
                          </Button>
                        </div>
                        <div>
                          <p className="font-semibold">{field.label}</p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{field.name}</span>
                            {' • '}
                            <span className="capitalize">{field.type}</span>
                            {field.required && ' • Obrigatório'}
                          </p>
                          {field.options && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Opções: {field.options.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(field)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(field)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Sliders className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Nenhum campo personalizado configurado para{' '}
                    {activeTab === 'patient' ? 'Pacientes' : activeTab === 'treatment' ? 'Tratamentos' : 'Prontuários'}
                  </p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeiro Campo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
