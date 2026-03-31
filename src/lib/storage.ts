import { Patient, Appointment, ClinicalRecord, Treatment, Transaction, StockItem, AuditLog, CustomField } from '@/types';

const STORAGE_KEYS = {
  PATIENTS: 'sorrisotech_patients',
  APPOINTMENTS: 'sorrisotech_appointments',
  RECORDS: 'sorrisotech_records',
  TREATMENTS: 'sorrisotech_treatments',
  TRANSACTIONS: 'sorrisotech_transactions',
  STOCK: 'sorrisotech_stock',
  AUDIT_LOGS: 'sorrisotech_audit_logs',
  CUSTOM_FIELDS: 'sorrisotech_custom_fields',
};

// Generic storage functions
export const getItems = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const setItems = <T>(key: string, items: T[]): void => {
  localStorage.setItem(key, JSON.stringify(items));
};

export const addItem = <T extends { id: string }>(key: string, item: T): void => {
  const items = getItems<T>(key);
  items.push(item);
  setItems(key, items);
};

export const updateItem = <T extends { id: string }>(key: string, id: string, updates: Partial<T>): void => {
  const items = getItems<T>(key);
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    setItems(key, items);
  }
};

export const deleteItem = (key: string, id: string): void => {
  const items = getItems(key);
  const filtered = items.filter((item: any) => item.id !== id);
  setItems(key, filtered);
};

// Specific functions
export const patients = {
  getAll: () => getItems<Patient>(STORAGE_KEYS.PATIENTS),
  add: (patient: Patient) => addItem(STORAGE_KEYS.PATIENTS, patient),
  update: (id: string, updates: Partial<Patient>) => updateItem(STORAGE_KEYS.PATIENTS, id, updates),
  delete: (id: string) => deleteItem(STORAGE_KEYS.PATIENTS, id),
  getById: (id: string) => getItems<Patient>(STORAGE_KEYS.PATIENTS).find(p => p.id === id),
};

export const appointments = {
  getAll: () => getItems<Appointment>(STORAGE_KEYS.APPOINTMENTS),
  add: (appointment: Appointment) => addItem(STORAGE_KEYS.APPOINTMENTS, appointment),
  update: (id: string, updates: Partial<Appointment>) => updateItem(STORAGE_KEYS.APPOINTMENTS, id, updates),
  delete: (id: string) => deleteItem(STORAGE_KEYS.APPOINTMENTS, id),
  getByDate: (date: string) => getItems<Appointment>(STORAGE_KEYS.APPOINTMENTS).filter(a => a.date === date),
  getByPatient: (patientId: string) => getItems<Appointment>(STORAGE_KEYS.APPOINTMENTS).filter(a => a.patientId === patientId),
};

export const clinicalRecords = {
  getAll: () => getItems<ClinicalRecord>(STORAGE_KEYS.RECORDS),
  add: (record: ClinicalRecord) => addItem(STORAGE_KEYS.RECORDS, record),
  update: (id: string, updates: Partial<ClinicalRecord>) => updateItem(STORAGE_KEYS.RECORDS, id, updates),
  getByPatient: (patientId: string) => getItems<ClinicalRecord>(STORAGE_KEYS.RECORDS).find(r => r.patientId === patientId),
};

export const treatments = {
  getAll: () => getItems<Treatment>(STORAGE_KEYS.TREATMENTS),
  add: (treatment: Treatment) => addItem(STORAGE_KEYS.TREATMENTS, treatment),
  update: (id: string, updates: Partial<Treatment>) => updateItem(STORAGE_KEYS.TREATMENTS, id, updates),
  getByPatient: (patientId: string) => getItems<Treatment>(STORAGE_KEYS.TREATMENTS).filter(t => t.patientId === patientId),
};

export const transactions = {
  getAll: () => getItems<Transaction>(STORAGE_KEYS.TRANSACTIONS),
  add: (transaction: Transaction) => addItem(STORAGE_KEYS.TRANSACTIONS, transaction),
  update: (id: string, updates: Partial<Transaction>) => updateItem(STORAGE_KEYS.TRANSACTIONS, id, updates),
  delete: (id: string) => deleteItem(STORAGE_KEYS.TRANSACTIONS, id),
};

export const stock = {
  getAll: () => getItems<StockItem>(STORAGE_KEYS.STOCK),
  add: (item: StockItem) => addItem(STORAGE_KEYS.STOCK, item),
  update: (id: string, updates: Partial<StockItem>) => updateItem(STORAGE_KEYS.STOCK, id, updates),
  delete: (id: string) => deleteItem(STORAGE_KEYS.STOCK, id),
  getLowStock: () => getItems<StockItem>(STORAGE_KEYS.STOCK).filter(i => i.quantity <= i.minQuantity),
};

export const auditLogs = {
  getAll: () => getItems<AuditLog>(STORAGE_KEYS.AUDIT_LOGS).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
  add: (log: AuditLog) => addItem(STORAGE_KEYS.AUDIT_LOGS, log),
  getByEntity: (entityType: string, entityId: string) => 
    getItems<AuditLog>(STORAGE_KEYS.AUDIT_LOGS).filter(log => log.entityType === entityType && log.entityId === entityId),
  getByUser: (userId: string) => 
    getItems<AuditLog>(STORAGE_KEYS.AUDIT_LOGS).filter(log => log.userId === userId),
};

export const customFields = {
  getAll: () => getItems<CustomField>(STORAGE_KEYS.CUSTOM_FIELDS).sort((a, b) => a.order - b.order),
  add: (field: CustomField) => addItem(STORAGE_KEYS.CUSTOM_FIELDS, field),
  update: (id: string, updates: Partial<CustomField>) => updateItem(STORAGE_KEYS.CUSTOM_FIELDS, id, updates),
  delete: (id: string) => deleteItem(STORAGE_KEYS.CUSTOM_FIELDS, id),
  getByEntity: (entityType: 'patient' | 'treatment' | 'record') => 
    getItems<CustomField>(STORAGE_KEYS.CUSTOM_FIELDS).filter(f => f.entityType === entityType).sort((a, b) => a.order - b.order),
};
