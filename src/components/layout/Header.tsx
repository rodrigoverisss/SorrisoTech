import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Bell, Calendar, Package, CreditCard, Cake, AlertTriangle, X, ChevronRight } from 'lucide-react';
import { logout } from '@/lib/auth';
import { getNotifications, Notification } from '@/lib/notifications';
import { cn } from '@/lib/utils';

const SEVERITY_STYLES: Record<string, string> = {
  danger: 'border-l-red-500 bg-red-50',
  warning: 'border-l-amber-500 bg-amber-50',
  info: 'border-l-blue-500 bg-blue-50',
};

const SEVERITY_ICON_STYLES: Record<string, string> = {
  danger: 'bg-red-100 text-red-600',
  warning: 'bg-amber-100 text-amber-600',
  info: 'bg-blue-100 text-blue-600',
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  appointment: Calendar,
  stock: Package,
  payment: CreditCard,
  birthday: Cake,
  medical: AlertTriangle,
};

export default function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = () => setNotifications(getNotifications());
    load();
    const interval = setInterval(load, 60000); // re-check every minute
    return () => clearInterval(interval);
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visible = notifications.filter((n) => !dismissed.has(n.id));
  const dangerCount = visible.filter((n) => n.severity === 'danger').length;
  const warningCount = visible.filter((n) => n.severity === 'warning').length;
  const totalCount = visible.length;

  const badgeColor =
    dangerCount > 0 ? 'bg-red-500' :
    warningCount > 0 ? 'bg-amber-500' :
    'bg-blue-500';

  const dismiss = (id: string) => setDismissed((prev) => new Set([...prev, id]));
  const dismissAll = () => setDismissed(new Set(notifications.map((n) => n.id)));

  const handleNotifClick = (notif: Notification) => {
    if (notif.link) navigate(notif.link);
    dismiss(notif.id);
    setOpen(false);
  };

  return (
    <header className="fixed left-64 right-0 top-0 z-30 h-16 border-b bg-white shadow-sm">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-800">Bem-vindo ao SorrisoTech</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Bell button */}
          <div className="relative" ref={panelRef}>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setOpen((o) => !o)}
              aria-label="Notificações"
            >
              <Bell className="h-5 w-5" />
              {totalCount > 0 && (
                <span
                  className={cn(
                    'absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white transition-all',
                    badgeColor
                  )}
                >
                  {totalCount > 9 ? '9+' : totalCount}
                </span>
              )}
            </Button>

            {/* Notification panel */}
            {open && (
              <div className="absolute right-0 top-12 z-50 w-[380px] rounded-xl border bg-white shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b">
                  <div>
                    <p className="font-semibold text-gray-800">Notificações</p>
                    <p className="text-xs text-muted-foreground">{totalCount} alerta(s) ativo(s)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {totalCount > 0 && (
                      <Button variant="ghost" size="sm" className="text-xs h-7" onClick={dismissAll}>
                        Limpar tudo
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* List */}
                <div className="max-h-[420px] overflow-y-auto divide-y">
                  {visible.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                      <Bell className="h-8 w-8 opacity-30" />
                      <p className="text-sm">Nenhuma notificação no momento</p>
                    </div>
                  ) : (
                    visible.map((notif) => {
                      const Icon = TYPE_ICONS[notif.type] || Bell;
                      return (
                        <div
                          key={notif.id}
                          className={cn(
                            'flex items-start gap-3 px-4 py-3 border-l-4 cursor-pointer hover:brightness-95 transition-all',
                            SEVERITY_STYLES[notif.severity]
                          )}
                          onClick={() => handleNotifClick(notif)}
                        >
                          <div className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full mt-0.5', SEVERITY_ICON_STYLES[notif.severity])}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">{notif.title}</p>
                            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{notif.message}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-60 hover:opacity-100"
                              onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            {notif.link && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer summary pills */}
                {totalCount > 0 && (
                  <div className="flex gap-2 px-4 py-2 border-t bg-gray-50 flex-wrap">
                    {dangerCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        {dangerCount} crítico{dangerCount > 1 ? 's' : ''}
                      </span>
                    )}
                    {warningCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        {warningCount} aviso{warningCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
