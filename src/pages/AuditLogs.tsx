import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { auditLogs } from '@/lib/storage';
import { getActionLabel, getEntityLabel } from '@/lib/audit';
import { Shield, Search, Calendar, User, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACTION_COLORS = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
};

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterEntity, setFilterEntity] = useState<string>('all');

  const allLogs = auditLogs.getAll();

  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      const matchesSearch = 
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAction = filterAction === 'all' || log.action === filterAction;
      const matchesEntity = filterEntity === 'all' || log.entityType === filterEntity;

      return matchesSearch && matchesAction && matchesEntity;
    });
  }, [allLogs, searchTerm, filterAction, filterEntity]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Log de Auditoria</h1>
        <p className="text-muted-foreground">Histórico completo de todas as ações no sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuário, entidade ou detalhes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Ações</SelectItem>
                <SelectItem value="create">Criação</SelectItem>
                <SelectItem value="update">Atualização</SelectItem>
                <SelectItem value="delete">Exclusão</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterEntity} onValueChange={setFilterEntity}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Entidades</SelectItem>
                <SelectItem value="patient">Pacientes</SelectItem>
                <SelectItem value="appointment">Consultas</SelectItem>
                <SelectItem value="record">Prontuários</SelectItem>
                <SelectItem value="treatment">Tratamentos</SelectItem>
                <SelectItem value="transaction">Transações</SelectItem>
                <SelectItem value="stock">Estoque</SelectItem>
                <SelectItem value="user">Usuários</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Atividades ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length > 0 ? (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div key={log.id} className="rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={cn(
                          'rounded-full px-3 py-1 text-xs font-medium',
                          ACTION_COLORS[log.action]
                        )}>
                          {getActionLabel(log.action)}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">
                          {getEntityLabel(log.entityType)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{log.userName}</span>
                        {log.entityName && (
                          <>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-medium">{log.entityName}</span>
                          </>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{log.details}</p>
                      
                      {log.changes && log.changes.length > 0 && (
                        <div className="mt-3 rounded-md bg-muted/50 p-3">
                          <p className="text-xs font-semibold mb-2">Alterações:</p>
                          <div className="space-y-1">
                            {log.changes.map((change, idx) => (
                              <div key={idx} className="text-xs">
                                <span className="font-medium">{change.field}:</span>{' '}
                                <span className="text-red-600 line-through">{String(change.oldValue)}</span>
                                {' → '}
                                <span className="text-green-600 font-medium">{String(change.newValue)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Nenhum registro de auditoria encontrado
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
