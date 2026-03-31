import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { stock } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { StockItem } from '@/types';
import { X } from 'lucide-react';

interface StockFormProps {
  item?: StockItem;
  onClose: () => void;
}

export default function StockForm({ item, onClose }: StockFormProps) {
  const [formData, setFormData] = useState<Partial<StockItem>>(
    item || {
      name: '',
      category: '',
      quantity: 0,
      unit: 'un',
      minQuantity: 10,
      supplier: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const stockData: StockItem = {
      id: item?.id || generateId(),
      name: formData.name!,
      category: formData.category!,
      quantity: formData.quantity!,
      unit: formData.unit!,
      minQuantity: formData.minQuantity!,
      supplier: formData.supplier,
    };

    if (item) {
      stock.update(item.id, stockData);
    } else {
      stock.add(stockData);
    }

    onClose();
    window.location.reload();
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{item ? 'Editar Item' : 'Novo Item'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Material *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Luvas descartáveis"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Descartáveis">Descartáveis</SelectItem>
                  <SelectItem value="Anestésicos">Anestésicos</SelectItem>
                  <SelectItem value="Restauração">Restauração</SelectItem>
                  <SelectItem value="Instrumental">Instrumental</SelectItem>
                  <SelectItem value="Radiografia">Radiografia</SelectItem>
                  <SelectItem value="Biossegurança">Biossegurança</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade Atual *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unidade *</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="un">Unidade</SelectItem>
                  <SelectItem value="cx">Caixa</SelectItem>
                  <SelectItem value="kg">Quilograma</SelectItem>
                  <SelectItem value="l">Litro</SelectItem>
                  <SelectItem value="ml">Mililitro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minQuantity">Estoque Mínimo *</Label>
              <Input
                id="minQuantity"
                type="number"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Nome do fornecedor"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {item ? 'Atualizar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
