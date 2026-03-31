import { appointments, patients, stock, transactions } from '@/lib/storage';

export interface Notification {
  id: string;
  type: 'appointment' | 'stock' | 'payment' | 'birthday' | 'medical';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'danger';
  timestamp: string;
  link?: string;
}

export const getNotifications = (): Notification[] => {
  const notifs: Notification[] = [];
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // ── Consultas próximas (próximas 2 horas) ──────────────────────────────
  const allAppointments = appointments.getAll();
  const upcoming = allAppointments.filter((a) => {
    if (a.status === 'cancelled' || a.status === 'completed') return false;
    if (a.date !== today) return false;
    const [h, m] = a.time.split(':').map(Number);
    const apptTime = new Date();
    apptTime.setHours(h, m, 0, 0);
    const diff = (apptTime.getTime() - now.getTime()) / 60000; // minutos
    return diff >= 0 && diff <= 120;
  });

  upcoming.forEach((a) => {
    const patient = patients.getById(a.patientId);
    notifs.push({
      id: `appt-${a.id}`,
      type: 'appointment',
      title: 'Consulta Próxima',
      message: `${patient?.name || 'Paciente'} — ${a.procedureType} às ${a.time}`,
      severity: 'info',
      timestamp: new Date().toISOString(),
      link: '/schedule',
    });
  });

  // ── Estoque baixo ────────────────────────────────────────────────────────
  const allStock = stock.getAll();
  const lowStock = allStock.filter((i) => i.quantity <= i.minQuantity);
  lowStock.forEach((item) => {
    notifs.push({
      id: `stock-${item.id}`,
      type: 'stock',
      title: 'Estoque Crítico',
      message: `${item.name}: ${item.quantity} ${item.unit} restante(s) (mín. ${item.minQuantity})`,
      severity: item.quantity === 0 ? 'danger' : 'warning',
      timestamp: new Date().toISOString(),
      link: '/stock',
    });
  });

  // ── Pagamentos pendentes ─────────────────────────────────────────────────
  const allTransactions = transactions.getAll();
  const pendingPayments = allTransactions.filter((t) => t.status === 'pending');
  if (pendingPayments.length > 0) {
    const totalPending = pendingPayments.reduce((sum, t) => sum + t.value, 0);
    notifs.push({
      id: 'payments-pending',
      type: 'payment',
      title: 'Pagamentos Pendentes',
      message: `${pendingPayments.length} transação(ões) pendente(s) — R$ ${totalPending.toFixed(2)}`,
      severity: 'warning',
      timestamp: new Date().toISOString(),
      link: '/financial',
    });
  }

  // ── Aniversários de hoje ──────────────────────────────────────────────────
  const allPatients = patients.getAll();
  const todayMMDD = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const birthdayPatients = allPatients.filter((p) => {
    if (!p.birthDate) return false;
    const mmdd = p.birthDate.substring(5); // "MM-DD"
    return mmdd === todayMMDD;
  });

  birthdayPatients.forEach((p) => {
    notifs.push({
      id: `birthday-${p.id}`,
      type: 'birthday',
      title: 'Aniversário Hoje!',
      message: `Feliz aniversário para ${p.name}! 🎂`,
      severity: 'info',
      timestamp: new Date().toISOString(),
      link: '/patients',
    });
  });

  // ── Alertas médicos (pacientes com condições críticas sem consulta recente) ──
  const diabeticPatients = allPatients.filter((p) =>
    p.medicalInfo?.diseases?.some((d) => d.toLowerCase().includes('diabet'))
  );
  if (diabeticPatients.length > 0) {
    notifs.push({
      id: 'medical-diabetic',
      type: 'medical',
      title: 'Alerta Clínico',
      message: `${diabeticPatients.length} paciente(s) com diabetes cadastrado(s) — atenção ao plano de tratamento.`,
      severity: 'warning',
      timestamp: new Date().toISOString(),
      link: '/patients',
    });
  }

  // Sort: danger first, then warning, then info
  const order = { danger: 0, warning: 1, info: 2 };
  return notifs.sort((a, b) => order[a.severity] - order[b.severity]);
};
