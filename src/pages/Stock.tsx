import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { stock } from '@/lib/storage';
import { Plus, Search, Package, AlertTriangle } from 'lucide-react';
import StockForm from '@/components/forms/StockForm';
import { StockItem } from '@/types';

export default function Stock() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  
  const allItems = stock.getAll();
  const lowStockItems = stock.getLowStock();
  
  const filteredItems = allItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estoque</h1>
          <p className="text-muted-foreground">Controle de materiais odontológicos</p>
        </div>
        <Button onClick={() => setShowForm(true)} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Adicionar Item
        </Button>
      </div>

      {showForm && (
        <StockForm 
          item={selectedItem || undefined} 
          onClose={() => {
            setShowForm(false);
            setSelectedItem(null);
          }}
        />
      )}

      {lowStockItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Alerta de Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg bg-white p-3">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-orange-600">
                    Estoque: {item.quantity} {item.unit} (Mínimo: {item.minQuantity})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar material..."
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
                  <th className="p-3 text-left text-sm font-semibold">Material</th>
                  <th className="p-3 text-left text-sm font-semibold">Categoria</th>
                  <th className="p-3 text-center text-sm font-semibold">Quantidade</th>
                  <th className="p-3 text-center text-sm font-semibold">Mínimo</th>
                  <th className="p-3 text-center text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => {
                    const isLow = item.quantity <= item.minQuantity;
                    return (
                      <tr key={item.id} className="hover:bg-muted/30">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Package className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm">{item.category}</td>
                        <td className="p-3 text-center">
                          <span className={`font-medium ${isLow ? 'text-orange-600' : ''}`}>
                            {item.quantity} {item.unit}
                          </span>
                        </td>
                        <td className="p-3 text-center text-sm text-muted-foreground">
                          {item.minQuantity} {item.unit}
                        </td>
                        <td className="p-3 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                              <AlertTriangle className="h-3 w-3" />
                              Baixo
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                              OK
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Nenhum material encontrado
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
