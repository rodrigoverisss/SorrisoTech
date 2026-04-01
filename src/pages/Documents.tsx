import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { patients, treatments } from '@/lib/storage';
import { getCurrentUser } from '@/lib/auth';
import { formatCurrency } from '@/lib/utils';
import {
  FileText,
  Printer,
  Stethoscope,
  ClipboardCheck,
  ShieldCheck,
  Receipt,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

const DENTIST_OPTIONS = [
  { id: 'dentist1', name: 'Dr. Carlos Silva', cro: 'CRO-SP 12345' },
  { id: 'dentist2', name: 'Dra. Ana Paula Santos', cro: 'CRO-SP 23456' },
  { id: 'dentist3', name: 'Dr. Roberto Costa', cro: 'CRO-SP 34567' },
  { id: 'dentist4', name: 'Dra. Fernanda Oliveira', cro: 'CRO-SP 45678' },
];

function getClinicConfig() {
  const saved = localStorage.getItem('sorrisotech_clinic_config');
  return saved
    ? JSON.parse(saved)
    : {
        name: 'Clínica Sorriso Feliz',
        cnpj: '00.000.000/0000-00',
        phone: '(11) 98765-4321',
        email: 'contato@clinica.com',
        address: 'Rua Exemplo, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
      };
}

// ─────────────────────────────────────────────
// Print Helper
// ─────────────────────────────────────────────
function printDocument(html: string, title: string) {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    toast.error('Permita pop-ups para imprimir documentos');
    return;
  }
  win.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #111; background: #fff; padding: 0; }
        .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 20mm 20mm 25mm; position: relative; }
        .header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 14px; margin-bottom: 18px; }
        .clinic-logo { display: flex; align-items: center; gap: 10px; }
        .logo-icon { width: 46px; height: 46px; background: #059669; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 22px; font-weight: bold; }
        .clinic-name { font-size: 16pt; font-weight: bold; color: #059669; line-height: 1.2; }
        .clinic-sub { font-size: 8pt; color: #555; }
        .clinic-info { text-align: right; font-size: 8pt; color: #555; line-height: 1.6; }
        .doc-title { text-align: center; font-size: 16pt; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #059669; margin: 16px 0 8px; border-bottom: 1px solid #d1fae5; padding-bottom: 8px; }
        .doc-date { text-align: right; font-size: 9pt; color: #666; margin-bottom: 18px; }
        .patient-box { border: 1px solid #d1d5db; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px; background: #f9fafb; }
        .patient-box h4 { font-size: 9pt; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; margin-bottom: 6px; }
        .patient-box .patient-name { font-size: 13pt; font-weight: bold; }
        .patient-box .patient-meta { font-size: 9pt; color: #555; margin-top: 4px; }
        .section { margin-bottom: 18px; }
        .section h3 { font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #059669; border-bottom: 1px solid #d1fae5; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 0.5px; }
        .content-block { font-size: 11pt; line-height: 1.8; min-height: 60px; }
        .rx-symbol { font-size: 28pt; font-weight: bold; color: #059669; margin-bottom: 4px; font-family: serif; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10pt; }
        .table th { background: #059669; color: white; padding: 8px 10px; text-align: left; font-size: 9pt; text-transform: uppercase; }
        .table td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; }
        .table tr:nth-child(even) td { background: #f0fdf4; }
        .total-row td { font-weight: bold; border-top: 2px solid #059669; font-size: 11pt; }
        .signature-area { margin-top: 40px; display: flex; justify-content: space-between; gap: 30px; }
        .sig-block { flex: 1; text-align: center; }
        .sig-line { border-top: 1px solid #374151; margin-bottom: 6px; padding-top: 6px; font-size: 9pt; }
        .sig-name { font-size: 10pt; font-weight: bold; }
        .sig-cro { font-size: 8pt; color: #6b7280; }
        .footer { position: absolute; bottom: 15mm; left: 20mm; right: 20mm; text-align: center; font-size: 7.5pt; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 8pt; background: #d1fae5; color: #065f46; font-weight: bold; margin-top: 4px; }
        .validity { font-size: 9pt; color: #6b7280; margin-top: 8px; font-style: italic; }
        @media print {
          html, body { margin: 0; padding: 0; }
          .page { padding: 15mm 18mm 20mm; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      ${html}
      <script>window.onload = function() { window.print(); }<\/script>
    </body>
    </html>
  `);
  win.document.close();
}

// ─────────────────────────────────────────────
// Header HTML shared across documents
// ─────────────────────────────────────────────
function buildHeader(clinic: ReturnType<typeof getClinicConfig>, docTitle: string) {
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  return `
    <div class="page">
      <div class="header">
        <div class="clinic-logo">
          <div class="logo-icon">✦</div>
          <div>
            <div class="clinic-name">${clinic.name}</div>
            <div class="clinic-sub">Clínica Odontológica</div>
          </div>
        </div>
        <div class="clinic-info">
          ${clinic.address}, ${clinic.city} - ${clinic.state}<br/>
          CEP: ${clinic.zipCode}<br/>
          Tel: ${clinic.phone}<br/>
          CNPJ: ${clinic.cnpj}
        </div>
      </div>
      <div class="doc-title">${docTitle}</div>
      <div class="doc-date">${clinic.city}, ${today}</div>
  `;
}

// ─────────────────────────────────────────────
// Document: Receita Médica
// ─────────────────────────────────────────────
interface PrescriptionData {
  patientId: string;
  dentistId: string;
  medications: string;
  instructions: string;
  validity: string;
}

function PrescriptionTab() {
  const allPatients = patients.getAll();
  const [data, setData] = useState<PrescriptionData>({
    patientId: '',
    dentistId: 'dentist1',
    medications: '',
    instructions: '',
    validity: '30',
  });

  const handlePrint = () => {
    if (!data.patientId || !data.medications) {
      toast.error('Selecione o paciente e informe os medicamentos');
      return;
    }
    const patient = patients.getById(data.patientId);
    const dentist = DENTIST_OPTIONS.find((d) => d.id === data.dentistId)!;
    const clinic = getClinicConfig();

    const html = `
      ${buildHeader(clinic, 'Receita Odontológica')}
      <div class="patient-box">
        <h4>Paciente</h4>
        <div class="patient-name">${patient?.name}</div>
        <div class="patient-meta">
          CPF: ${patient?.cpf || '—'} &nbsp;|&nbsp; 
          Nascimento: ${patient?.birthDate ? new Date(patient.birthDate).toLocaleDateString('pt-BR') : '—'}
        </div>
      </div>

      <div class="section">
        <div class="rx-symbol">Rx</div>
        <div class="content-block" style="white-space: pre-line; padding-left: 8px;">${data.medications}</div>
      </div>

      ${data.instructions ? `
      <div class="section">
        <h3>Instruções de Uso</h3>
        <div class="content-block" style="white-space: pre-line;">${data.instructions}</div>
      </div>` : ''}

      <div class="validity">Validade da receita: ${data.validity} dias a contar da data de emissão.</div>

      <div class="signature-area">
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-name">${dentist.name}</div>
          <div class="sig-cro">${dentist.cro}</div>
        </div>
      </div>

      <div class="footer">
        Documento emitido pelo SorrisoTech — Sistema de Gestão Odontológica &nbsp;|&nbsp; ${clinic.name} &nbsp;|&nbsp; CNPJ: ${clinic.cnpj}
      </div>
    </div>`;

    printDocument(html, `Receita - ${patient?.name}`);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Paciente *</Label>
          <Select value={data.patientId} onValueChange={(v) => setData({ ...data, patientId: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione o paciente" /></SelectTrigger>
            <SelectContent>
              {allPatients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Dentista Responsável *</Label>
          <Select value={data.dentistId} onValueChange={(v) => setData({ ...data, dentistId: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DENTIST_OPTIONS.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} — {d.cro}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Medicamentos e Dosagem *</Label>
        <Textarea
          rows={6}
          placeholder={`Ex:\n1. Amoxicilina 500mg — 1 cápsula a cada 8h por 7 dias\n2. Ibuprofeno 600mg — 1 comprimido a cada 6h (se dor)\n3. Dipirona 500mg — 1 comprimido a cada 6h (se febre)`}
          value={data.medications}
          onChange={(e) => setData({ ...data, medications: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Instruções Adicionais</Label>
        <Textarea
          rows={3}
          placeholder="Ex: Tomar após as refeições. Não ingerir bebidas alcoólicas durante o tratamento."
          value={data.instructions}
          onChange={(e) => setData({ ...data, instructions: e.target.value })}
        />
      </div>

      <div className="space-y-2 max-w-xs">
        <Label>Validade da Receita (dias)</Label>
        <Input
          type="number"
          value={data.validity}
          onChange={(e) => setData({ ...data, validity: e.target.value })}
          min="1"
        />
      </div>

      <Button onClick={handlePrint} className="w-full md:w-auto" size="lg">
        <Printer className="mr-2 h-5 w-5" />
        Gerar e Imprimir Receita
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Document: Atestado
// ─────────────────────────────────────────────
function CertificateTab() {
  const allPatients = patients.getAll();
  const [data, setData] = useState({
    patientId: '',
    dentistId: 'dentist1',
    restDays: '1',
    reason: 'tratamento odontológico',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '09:00',
    notes: '',
  });

  const handlePrint = () => {
    if (!data.patientId) { toast.error('Selecione o paciente'); return; }
    const patient = patients.getById(data.patientId);
    const dentist = DENTIST_OPTIONS.find((d) => d.id === data.dentistId)!;
    const clinic = getClinicConfig();
    const dateFormatted = new Date(data.date + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const days = parseInt(data.restDays);

    const html = `
      ${buildHeader(clinic, 'Atestado Odontológico')}
      <div class="patient-box">
        <h4>Paciente</h4>
        <div class="patient-name">${patient?.name}</div>
        <div class="patient-meta">CPF: ${patient?.cpf || '—'}</div>
      </div>

      <div class="section">
        <div class="content-block" style="line-height: 2; text-align: justify; font-size: 12pt;">
          Atesto para os devidos fins que o(a) paciente acima identificado(a) esteve sob meus cuidados odontológicos
          no dia <strong>${dateFormatted}</strong>, das <strong>${data.startTime}h</strong> às <strong>${data.endTime}h</strong>,
          necessitando de <strong>${days} (${days === 1 ? 'um' : days === 2 ? 'dois' : days + ''}) dia${days > 1 ? 's' : ''}</strong>
          de repouso / afastamento de suas atividades em virtude de <strong>${data.reason}</strong>.
          ${data.notes ? `<br/><br/>${data.notes}` : ''}
        </div>
      </div>

      <div class="signature-area" style="margin-top: 60px;">
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-name">${dentist.name}</div>
          <div class="sig-cro">${dentist.cro}</div>
        </div>
      </div>

      <div class="footer">
        Documento emitido pelo SorrisoTech — Sistema de Gestão Odontológica &nbsp;|&nbsp; ${clinic.name} &nbsp;|&nbsp; CNPJ: ${clinic.cnpj}
      </div>
    </div>`;

    printDocument(html, `Atestado - ${patient?.name}`);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Paciente *</Label>
          <Select value={data.patientId} onValueChange={(v) => setData({ ...data, patientId: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione o paciente" /></SelectTrigger>
            <SelectContent>
              {allPatients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Dentista Responsável *</Label>
          <Select value={data.dentistId} onValueChange={(v) => setData({ ...data, dentistId: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DENTIST_OPTIONS.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} — {d.cro}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Data do Atendimento *</Label>
          <Input type="date" value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Dias de Afastamento *</Label>
          <Input type="number" min="1" value={data.restDays} onChange={(e) => setData({ ...data, restDays: e.target.value })} />
        </div>

        <div className="space-y-2">
          <Label>Horário Início</Label>
          <Input type="time" value={data.startTime} onChange={(e) => setData({ ...data, startTime: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Horário Fim</Label>
          <Input type="time" value={data.endTime} onChange={(e) => setData({ ...data, endTime: e.target.value })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Motivo do Atestado</Label>
        <Input value={data.reason} onChange={(e) => setData({ ...data, reason: e.target.value })} placeholder="Ex: tratamento odontológico, cirurgia oral, extração dentária..." />
      </div>

      <div className="space-y-2">
        <Label>Observações Adicionais</Label>
        <Textarea rows={3} value={data.notes} onChange={(e) => setData({ ...data, notes: e.target.value })} placeholder="Recomendações médicas, restrições..." />
      </div>

      <Button onClick={handlePrint} className="w-full md:w-auto" size="lg">
        <Printer className="mr-2 h-5 w-5" />
        Gerar e Imprimir Atestado
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Document: Termo de Consentimento
// ─────────────────────────────────────────────
const CONSENT_TEMPLATES: Record<string, string> = {
  extraction: `Autorizo o(a) Dr(a). responsável a realizar o procedimento de EXTRAÇÃO DENTÁRIA, cujos riscos, benefícios e alternativas de tratamento foram devidamente esclarecidos. Estou ciente de que podem ocorrer complicações como dor, inchaço, sangramento, infecção e parestesia temporária, que serão tratadas pelo(a) profissional responsável.`,
  implant: `Autorizo o(a) Dr(a). responsável a realizar o procedimento de IMPLANTE DENTÁRIO (osseointegração). Declaro ter sido informado(a) sobre os riscos, incluindo rejeição do implante, infecção, danos a estruturas adjacentes, e complicações anestésicas. Estou ciente da necessidade de cumprimento rigoroso das orientações pós-operatórias.`,
  canal: `Autorizo o(a) Dr(a). responsável a realizar o procedimento de TRATAMENTO ENDODÔNTICO (canal radicular). Fui informado(a) sobre os riscos do procedimento, incluindo possibilidade de fratura de instrumento, perfuração radicular, hipersensibilidade e necessidade de reintervenção.`,
  bleaching: `Autorizo o(a) Dr(a). responsável a realizar o procedimento de CLAREAMENTO DENTAL. Estou ciente de que podem ocorrer hipersensibilidade dentária temporária e irritação gengival. Declaro que fui informado(a) que o resultado pode variar conforme o tipo de mancha e características individuais.`,
  surgery: `Autorizo o(a) Dr(a). responsável a realizar o procedimento CIRÚRGICO descrito, incluindo anestesia local. Declaro ter sido informado(a) sobre todos os riscos inerentes ao procedimento, pós-operatório, medicamentos prescritos e necessidade de retorno para avaliação.`,
  custom: '',
};

function ConsentTab() {
  const allPatients = patients.getAll();
  const [data, setData] = useState({
    patientId: '',
    dentistId: 'dentist1',
    procedure: '',
    templateKey: 'extraction',
    consentText: CONSENT_TEMPLATES['extraction'],
    responsible: '',
    responsibleCpf: '',
  });

  const handleTemplateChange = (key: string) => {
    setData({ ...data, templateKey: key, consentText: CONSENT_TEMPLATES[key] });
  };

  const handlePrint = () => {
    if (!data.patientId) { toast.error('Selecione o paciente'); return; }
    const patient = patients.getById(data.patientId);
    const dentist = DENTIST_OPTIONS.find((d) => d.id === data.dentistId)!;
    const clinic = getClinicConfig();
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    const isMinor = patient?.birthDate ? 
      (new Date().getFullYear() - new Date(patient.birthDate).getFullYear()) < 18 : false;

    const html = `
      ${buildHeader(clinic, 'Termo de Consentimento Informado')}
      <div class="patient-box">
        <h4>Paciente</h4>
        <div class="patient-name">${patient?.name}</div>
        <div class="patient-meta">CPF: ${patient?.cpf || '—'} &nbsp;|&nbsp; Nascimento: ${patient?.birthDate ? new Date(patient.birthDate + 'T12:00').toLocaleDateString('pt-BR') : '—'}${isMinor ? ' &nbsp;<span class="badge">Menor de Idade</span>' : ''}</div>
      </div>

      <div class="section">
        <h3>${data.procedure || 'Procedimento Odontológico'}</h3>
        <div class="content-block" style="text-align: justify; line-height: 1.9; font-size: 11pt;">
          ${data.consentText || CONSENT_TEMPLATES[data.templateKey]}
        </div>
      </div>

      <div class="section">
        <div class="content-block" style="font-size: 11pt; line-height: 1.9; text-align: justify;">
          Declaro ainda que todas as minhas dúvidas foram esclarecidas pelo(a) profissional responsável e que estou de acordo com o tratamento proposto, podendo revogar este consentimento a qualquer momento antes do início do procedimento, sem qualquer ônus.
        </div>
      </div>

      <div class="signature-area" style="margin-top: 50px;">
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-name">${patient?.name}</div>
          <div class="sig-cro">${isMinor && data.responsible ? `Responsável: ${data.responsible}${data.responsibleCpf ? ' — CPF: ' + data.responsibleCpf : ''}` : `CPF: ${patient?.cpf || '—'}`}</div>
        </div>
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-name">${dentist.name}</div>
          <div class="sig-cro">${dentist.cro} &nbsp;|&nbsp; Cirurgião-Dentista</div>
        </div>
      </div>

      <div style="margin-top: 20px; font-size: 9pt; color: #6b7280; text-align: center;">
        ${clinic.city}, ${today}
      </div>

      <div class="footer">
        Documento emitido pelo SorrisoTech — Sistema de Gestão Odontológica &nbsp;|&nbsp; ${clinic.name} &nbsp;|&nbsp; CNPJ: ${clinic.cnpj}
      </div>
    </div>`;

    printDocument(html, `Consentimento - ${patient?.name}`);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Paciente *</Label>
          <Select value={data.patientId} onValueChange={(v) => setData({ ...data, patientId: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione o paciente" /></SelectTrigger>
            <SelectContent>
              {allPatients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Dentista Responsável *</Label>
          <Select value={data.dentistId} onValueChange={(v) => setData({ ...data, dentistId: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DENTIST_OPTIONS.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} — {d.cro}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Modelo de Termo</Label>
        <Select value={data.templateKey} onValueChange={handleTemplateChange}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="extraction">Extração Dentária</SelectItem>
            <SelectItem value="implant">Implante Dentário</SelectItem>
            <SelectItem value="canal">Tratamento de Canal</SelectItem>
            <SelectItem value="bleaching">Clareamento Dental</SelectItem>
            <SelectItem value="surgery">Cirurgia Oral</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Título do Procedimento</Label>
        <Input
          value={data.procedure}
          onChange={(e) => setData({ ...data, procedure: e.target.value })}
          placeholder="Ex: Extração do dente 38 (siso inferior esquerdo)"
        />
      </div>

      <div className="space-y-2">
        <Label>Texto do Consentimento</Label>
        <Textarea
          rows={6}
          value={data.consentText}
          onChange={(e) => setData({ ...data, consentText: e.target.value })}
          placeholder="Descreva o consentimento informado..."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Responsável Legal (se menor de idade)</Label>
          <Input value={data.responsible} onChange={(e) => setData({ ...data, responsible: e.target.value })} placeholder="Nome completo do responsável" />
        </div>
        <div className="space-y-2">
          <Label>CPF do Responsável</Label>
          <Input value={data.responsibleCpf} onChange={(e) => setData({ ...data, responsibleCpf: e.target.value })} placeholder="000.000.000-00" />
        </div>
      </div>

      <Button onClick={handlePrint} className="w-full md:w-auto" size="lg">
        <Printer className="mr-2 h-5 w-5" />
        Gerar e Imprimir Termo
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Document: Orçamento
// ─────────────────────────────────────────────
function BudgetTab() {
  const allPatients = patients.getAll();
  const [patientId, setPatientId] = useState('');
  const [dentistId, setDentistId] = useState('dentist1');
  const [validity, setValidity] = useState('30');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [useExisting, setUseExisting] = useState(true);
  const [selectedTreatmentId, setSelectedTreatmentId] = useState('');
  const [manualProcedures, setManualProcedures] = useState([{ name: '', value: 0 }]);

  const patientTreatments = patientId ? treatments.getByPatient(patientId) : [];

  const addManualRow = () => setManualProcedures([...manualProcedures, { name: '', value: 0 }]);
  const updateRow = (i: number, field: 'name' | 'value', val: string | number) => {
    const updated = [...manualProcedures];
    (updated[i] as any)[field] = val;
    setManualProcedures(updated);
  };
  const removeRow = (i: number) => setManualProcedures(manualProcedures.filter((_, idx) => idx !== i));

  const handlePrint = () => {
    if (!patientId) { toast.error('Selecione o paciente'); return; }
    const patient = patients.getById(patientId);
    const dentist = DENTIST_OPTIONS.find((d) => d.id === dentistId)!;
    const clinic = getClinicConfig();
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    let procedures: { name: string; value: number }[] = [];
    let installments = 1;

    if (useExisting && selectedTreatmentId) {
      const treatment = patientTreatments.find((t) => t.id === selectedTreatmentId);
      procedures = treatment?.procedures || [];
      installments = treatment?.installments || 1;
    } else {
      procedures = manualProcedures.filter((p) => p.name.trim() && p.value > 0);
    }

    if (procedures.length === 0) { toast.error('Adicione pelo menos um procedimento'); return; }

    const total = procedures.reduce((sum, p) => sum + p.value, 0);
    const installmentValue = total / installments;

    const rows = procedures.map((p) => `
      <tr>
        <td>${p.name}</td>
        <td style="text-align:right;">${formatCurrency(p.value)}</td>
      </tr>
    `).join('');

    const html = `
      ${buildHeader(clinic, 'Orçamento de Tratamento')}
      <div class="patient-box">
        <h4>Paciente</h4>
        <div class="patient-name">${patient?.name}</div>
        <div class="patient-meta">
          CPF: ${patient?.cpf || '—'} &nbsp;|&nbsp; Tel: ${patient?.phone || '—'}
        </div>
      </div>

      <div class="section">
        <h3>Procedimentos</h3>
        <table class="table">
          <thead>
            <tr><th>Procedimento</th><th style="text-align:right;">Valor</th></tr>
          </thead>
          <tbody>
            ${rows}
            <tr class="total-row">
              <td><strong>TOTAL</strong></td>
              <td style="text-align:right;"><strong>${formatCurrency(total)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section">
        <h3>Condições de Pagamento</h3>
        <table class="table">
          <tbody>
            <tr><td><strong>Total do Tratamento</strong></td><td style="text-align:right;"><strong>${formatCurrency(total)}</strong></td></tr>
            <tr><td>Número de Parcelas</td><td style="text-align:right;">${installments}x</td></tr>
            <tr><td>Valor por Parcela</td><td style="text-align:right;">${formatCurrency(installmentValue)}</td></tr>
            ${paymentMethod ? `<tr><td>Forma de Pagamento</td><td style="text-align:right;">${paymentMethod}</td></tr>` : ''}
          </tbody>
        </table>
      </div>

      ${notes ? `
      <div class="section">
        <h3>Observações</h3>
        <div class="content-block" style="white-space: pre-line;">${notes}</div>
      </div>` : ''}

      <div class="validity">
        Validade deste orçamento: <strong>${validity} dias</strong> a contar de ${today}.
      </div>

      <div class="signature-area" style="margin-top: 50px;">
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-name">${patient?.name}</div>
          <div class="sig-cro">Assinatura do Paciente</div>
        </div>
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-name">${dentist.name}</div>
          <div class="sig-cro">${dentist.cro}</div>
        </div>
      </div>

      <div class="footer">
        Orçamento emitido pelo SorrisoTech — Sistema de Gestão Odontológica &nbsp;|&nbsp; ${clinic.name} &nbsp;|&nbsp; CNPJ: ${clinic.cnpj}
      </div>
    </div>`;

    printDocument(html, `Orçamento - ${patient?.name}`);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Paciente *</Label>
          <Select value={patientId} onValueChange={(v) => { setPatientId(v); setSelectedTreatmentId(''); }}>
            <SelectTrigger><SelectValue placeholder="Selecione o paciente" /></SelectTrigger>
            <SelectContent>
              {allPatients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Dentista Responsável</Label>
          <Select value={dentistId} onValueChange={setDentistId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DENTIST_OPTIONS.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} — {d.cro}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {patientId && (
        <div className="space-y-3">
          <div className="flex rounded-lg border overflow-hidden">
            <button
              type="button"
              onClick={() => setUseExisting(true)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${useExisting ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              Usar Tratamento Cadastrado
            </button>
            <button
              type="button"
              onClick={() => setUseExisting(false)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${!useExisting ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              Digitar Procedimentos
            </button>
          </div>

          {useExisting ? (
            <div className="space-y-2">
              <Label>Tratamento do Paciente</Label>
              <Select value={selectedTreatmentId} onValueChange={setSelectedTreatmentId}>
                <SelectTrigger><SelectValue placeholder="Selecione o tratamento" /></SelectTrigger>
                <SelectContent>
                  {patientTreatments.length > 0
                    ? patientTreatments.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.procedures.map((p) => p.name).join(', ')} — {formatCurrency(t.totalValue)}
                        </SelectItem>
                      ))
                    : <SelectItem value="_none" disabled>Nenhum tratamento cadastrado</SelectItem>
                  }
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-3">
              <Label>Procedimentos e Valores</Label>
              {manualProcedures.map((row, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    placeholder="Nome do procedimento"
                    value={row.name}
                    onChange={(e) => updateRow(i, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="R$"
                    value={row.value || ''}
                    onChange={(e) => updateRow(i, 'value', parseFloat(e.target.value) || 0)}
                    className="w-28"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(i)} disabled={manualProcedures.length === 1}>
                    <span className="text-destructive text-lg font-bold">×</span>
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addManualRow}>+ Adicionar Procedimento</Button>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Validade do Orçamento (dias)</Label>
          <Input type="number" value={validity} onChange={(e) => setValidity(e.target.value)} min="1" />
        </div>
        <div className="space-y-2">
          <Label>Forma de Pagamento Preferencial</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Dinheiro">Dinheiro</SelectItem>
              <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
              <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
              <SelectItem value="PIX">PIX</SelectItem>
              <SelectItem value="Boleto Bancário">Boleto Bancário</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Observações</Label>
        <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Informações adicionais sobre o orçamento..." />
      </div>

      <Button onClick={handlePrint} className="w-full md:w-auto" size="lg">
        <Printer className="mr-2 h-5 w-5" />
        Gerar e Imprimir Orçamento
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const DOC_TYPES = [
  { key: 'prescription', icon: Stethoscope, label: 'Receita Médica', color: 'bg-green-100 text-green-700', desc: 'Prescrição de medicamentos com assinatura digital' },
  { key: 'certificate', icon: ClipboardCheck, label: 'Atestado', color: 'bg-blue-100 text-blue-700', desc: 'Atestado de comparecimento e afastamento' },
  { key: 'consent', icon: ShieldCheck, label: 'Termo de Consentimento', color: 'bg-amber-100 text-amber-700', desc: 'Consentimento informado para procedimentos' },
  { key: 'budget', icon: Receipt, label: 'Orçamento', color: 'bg-purple-100 text-purple-700', desc: 'Orçamento detalhado de tratamento' },
];

export default function Documents() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Documentos</h1>
        <p className="text-muted-foreground">Gere e imprima documentos odontológicos profissionais</p>
      </div>

      {/* Quick cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {DOC_TYPES.map((doc) => {
          const Icon = doc.icon;
          return (
            <Card key={doc.key} className="hover:shadow-md transition-shadow cursor-default">
              <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${doc.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{doc.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{doc.desc}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Gerar Documento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="prescription">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="prescription" className="text-xs sm:text-sm">
                <Stethoscope className="h-4 w-4 mr-1.5" />
                Receita
              </TabsTrigger>
              <TabsTrigger value="certificate" className="text-xs sm:text-sm">
                <ClipboardCheck className="h-4 w-4 mr-1.5" />
                Atestado
              </TabsTrigger>
              <TabsTrigger value="consent" className="text-xs sm:text-sm">
                <ShieldCheck className="h-4 w-4 mr-1.5" />
                Consentimento
              </TabsTrigger>
              <TabsTrigger value="budget" className="text-xs sm:text-sm">
                <Receipt className="h-4 w-4 mr-1.5" />
                Orçamento
              </TabsTrigger>
            </TabsList>

            <TabsContent value="prescription" className="mt-6">
              <PrescriptionTab />
            </TabsContent>
            <TabsContent value="certificate" className="mt-6">
              <CertificateTab />
            </TabsContent>
            <TabsContent value="consent" className="mt-6">
              <ConsentTab />
            </TabsContent>
            <TabsContent value="budget" className="mt-6">
              <BudgetTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
