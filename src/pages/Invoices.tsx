import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function Invoices() {
  // Mock data para demonstração
  const invoices = [
    { id: '1', number: 'NFS-e 001/2026', client: 'João Silva', value: 350.00, date: '2026-03-20', status: 'issued', type: 'NFS-e' },
    { id: '2', number: 'NFS-e 002/2026', client: 'Maria Santos', value: 800.00, date: '2026-03-22', status: 'issued', type: 'NFS-e' },
    { id: '3', number: 'NFS-e 003/2026', client: 'Carlos Oliveira', value: 1200.00, date: '2026-03-24', status: 'pending', type: 'NFS-e' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'issued':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'issued':
        return 'Emitida';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notas Fiscais</h1>
          <p className="text-muted-foreground">Emissão e controle de notas fiscais</p>
        </div>
        <Button size="lg">
          <FileText className="mr-2 h-5 w-5" />
          Emitir Nota Fiscal
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Emitidas
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2</div>
            <p className="text-xs text-muted-foreground mt-1">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendentes
            </CardTitle>
            <Clock className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando emissão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Total
            </CardTitle>
            <FileText className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ 2.350,00</div>
            <p className="text-xs text-muted-foreground mt-1">Este mês</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notas Fiscais Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold">Número</th>
                  <th className="p-3 text-left text-sm font-semibold">Cliente</th>
                  <th className="p-3 text-left text-sm font-semibold">Tipo</th>
                  <th className="p-3 text-left text-sm font-semibold">Data</th>
                  <th className="p-3 text-left text-sm font-semibold">Valor</th>
                  <th className="p-3 text-left text-sm font-semibold">Status</th>
                  <th className="p-3 text-right text-sm font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{invoice.number}</td>
                    <td className="p-3">{invoice.client}</td>
                    <td className="p-3 text-sm">
                      <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        {invoice.type}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      {new Date(invoice.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3 font-medium">
                      R$ {invoice.value.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(invoice.status)}
                        <span className="text-sm">{getStatusText(invoice.status)}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <FileText className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Integração com Sistemas Fiscais</h3>
              <p className="text-sm text-blue-700 mb-3">
                Para emitir notas fiscais reais, é necessário integrar com a Prefeitura (NFS-e) ou SEFAZ (NFC-e/NFe).
              </p>
              <p className="text-sm text-blue-700">
                Esta funcionalidade está disponível para demonstração. Configure suas credenciais fiscais nas Configurações do sistema.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
