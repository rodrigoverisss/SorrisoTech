import { AuditLog } from '@/types';
import { auditLogs } from '@/lib/storage';
import { generateId } from '@/lib/utils';

export const logAction = (
  action: 'create' | 'update' | 'delete',
  entityType: AuditLog['entityType'],
  entityId: string,
  entityName: string,
  details: string,
  changes?: { field: string; oldValue: any; newValue: any }[]
) => {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) return;

  const user = JSON.parse(currentUser);

  const log: AuditLog = {
    id: generateId(),
    userId: user.id,
    userName: user.name,
    action,
    entityType,
    entityId,
    entityName,
    details,
    timestamp: new Date().toISOString(),
    changes,
  };

  auditLogs.add(log);
};

export const getActionLabel = (action: string): string => {
  const labels: Record<string, string> = {
    create: 'Criou',
    update: 'Atualizou',
    delete: 'Excluiu',
  };
  return labels[action] || action;
};

export const getEntityLabel = (entityType: string): string => {
  const labels: Record<string, string> = {
    patient: 'Paciente',
    appointment: 'Consulta',
    record: 'Prontuário',
    treatment: 'Tratamento',
    transaction: 'Transação',
    stock: 'Item de Estoque',
    user: 'Usuário',
  };
  return labels[entityType] || entityType;
};
