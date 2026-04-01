import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  ClipboardList,
  DollarSign,
  Package,
  Receipt,
  BarChart3,
  Settings,
  Stethoscope,
  MessageSquare,
  Shield,
  Sliders,
  FilePen,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'dentist', 'receptionist'] },
  { icon: Users, label: 'Pacientes', path: '/patients', roles: ['admin', 'dentist', 'receptionist'] },
  { icon: Calendar, label: 'Agenda', path: '/schedule', roles: ['admin', 'dentist', 'receptionist'] },
  { icon: Stethoscope, label: 'Prontuário', path: '/records', roles: ['admin', 'dentist'] },
  { icon: ClipboardList, label: 'Tratamentos', path: '/treatments', roles: ['admin', 'dentist'] },
  { icon: DollarSign, label: 'Financeiro', path: '/financial', roles: ['admin'] },
  { icon: Package, label: 'Estoque', path: '/stock', roles: ['admin'] },
  { icon: Receipt, label: 'Notas Fiscais', path: '/invoices', roles: ['admin'] },
  { icon: BarChart3, label: 'Relatórios', path: '/reports', roles: ['admin'] },
  { icon: MessageSquare, label: 'WhatsApp', path: '/whatsapp', roles: ['admin'] },
  { icon: Shield, label: 'Auditoria', path: '/audit', roles: ['admin'] },
  { icon: FilePen, label: 'Documentos', path: '/documents', roles: ['admin', 'dentist'] },
  { icon: Sliders, label: 'Campos Personalizados', path: '/custom-fields', roles: ['admin'] },
  { icon: Settings, label: 'Configurações', path: '/settings', roles: ['admin'] },
];

export default function Sidebar() {
  const location = useLocation();
  const user = getCurrentUser();

  const filteredItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary">SorrisoTech</h1>
            <p className="text-xs text-muted-foreground">Gestão Odontológica</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1 p-4">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="absolute bottom-0 w-full border-t bg-gray-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-semibold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
