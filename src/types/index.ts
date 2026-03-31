export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'dentist' | 'receptionist';
  photo?: string;
}

export interface Patient {
  id: string;
  name: string;
  cpf: string;
  rg?: string;
  birthDate: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  medicalInfo: {
    allergies: string[];
    diseases: string[];
    medications: string[];
    medicalHistory: string;
  };
  photo?: string;
  documents: string[];
  customFields?: CustomFieldValue[];
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  dentistId: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  procedureType: string;
}

export interface ToothCondition {
  toothNumber: number;
  conditions: Array<'healthy' | 'cavity' | 'restoration' | 'implant' | 'extraction' | 'root-canal' | 'crown'>;
  notes?: string;
  faces?: Array<'occlusal' | 'mesial' | 'distal' | 'buccal' | 'lingual'>;
}

export interface Anamnesis {
  hasDiabetes: boolean;
  hasHeartProblems: boolean;
  hasAllergies: boolean;
  allergiesList: string[];
  currentMedications: string[];
  hasSurgeryHistory: boolean;
  surgeryHistory: string;
  hasBleedingDisorder: boolean;
  isPregnant: boolean;
  isSmoker: boolean;
  alcoholConsumption: boolean;
  otherConditions: string;
  lastUpdate: string;
}

export interface ClinicalRecord {
  id: string;
  patientId: string;
  date: string;
  dentistId: string;
  anamnesis?: Anamnesis;
  odontogram: ToothCondition[];
  evolution: Array<{
    date: string;
    procedure: string;
    notes: string;
    dentistId: string;
  }>;
  customFields?: CustomFieldValue[];
}

export interface Treatment {
  id: string;
  patientId: string;
  procedures: Array<{
    name: string;
    value: number;
  }>;
  totalValue: number;
  installments: number;
  status: 'planned' | 'in-progress' | 'completed';
  startDate: string;
  endDate?: string;
  notes?: string;
  customFields?: CustomFieldValue[];
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  value: number;
  date: string;
  paymentMethod: string;
  status: 'pending' | 'paid' | 'cancelled';
  installments?: number;
  currentInstallment?: number;
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  cost?: number;
  supplier?: string;
  lastUpdate?: string;
}

export interface WhatsAppConfig {
  enabled: boolean;
  confirmationMessage: string;
  reminderMessage: string;
  returnMessage: string;
  reminderHoursBefore: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete';
  entityType: 'patient' | 'appointment' | 'record' | 'treatment' | 'transaction' | 'stock' | 'user';
  entityId: string;
  entityName?: string;
  details: string;
  timestamp: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
  options?: string[];
  required: boolean;
  entityType: 'patient' | 'treatment' | 'record';
  order: number;
}

export interface CustomFieldValue {
  fieldId: string;
  value: any;
}
