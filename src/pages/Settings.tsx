import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings as SettingsIcon, 
  Users, 
  Bell, 
  Shield, 
  Database, 
  Palette, 
  Building2,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  Save
} from 'lucide-react';
import { User } from '@/types';
import { generateId } from '@/lib/utils';
import { getCurrentUser, updateCurrentUser, changePassword } from '@/lib/auth';
import { toast } from 'sonner';
import { UserCircle, Lock, Eye, EyeOff } from 'lucide-react';

interface ClinicConfig {
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  logo?: string;
}

interface NotificationConfig {
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  lowStockAlerts: boolean;
  paymentReminders: boolean;
  birthdayMessages: boolean;
}

interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  // Current User Profile
  const currentUser = getCurrentUser();
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    role: currentUser?.role || 'dentist',
  });
  const [passwordData, setPasswordData] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const handleSaveProfile = () => {
    if (!profileData.name.trim() || !profileData.email.trim()) {
      toast.error('Nome e email são obrigatórios');
      return;
    }
    const success = updateCurrentUser({ name: profileData.name, email: profileData.email, role: profileData.role as User['role'] });
    if (success) {
      toast.success('Perfil atualizado com sucesso!');
    } else {
      toast.error('Erro ao atualizar perfil');
    }
  };

  const handleChangePassword = () => {
    if (!passwordData.current || !passwordData.newPass || !passwordData.confirm) {
      toast.error('Preencha todos os campos de senha');
      return;
    }
    if (passwordData.newPass !== passwordData.confirm) {
      toast.error('A nova senha e a confirmação não coincidem');
      return;
    }
    if (passwordData.newPass.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    const success = changePassword(passwordData.current, passwordData.newPass);
    if (success) {
      toast.success('Senha alterada com sucesso!');
      setPasswordData({ current: '', newPass: '', confirm: '' });
    } else {
      toast.error('Senha atual incorreta');
    }
  };

  // Clinic Configuration
  const [clinicConfig, setClinicConfig] = useState<ClinicConfig>(() => {
    const saved = localStorage.getItem('sorrisotech_clinic_config');
    return saved ? JSON.parse(saved) : {
      name: 'Clínica Sorriso Feliz',
      cnpj: '00.000.000/0000-00',
      phone: '(11) 98765-4321',
      email: 'contato@clinica.com',
      address: 'Rua Exemplo, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    };
  });

  // Users Management
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('sorrisotech_users');
    return saved ? JSON.parse(saved) : [
      { id: 'admin', name: 'Administrador', email: 'admin@clinica.com', role: 'admin' },
      { id: 'dentist1', name: 'Dr. Silva', email: 'silva@clinica.com', role: 'dentist' },
      { id: 'dentist2', name: 'Dra. Santos', email: 'santos@clinica.com', role: 'dentist' },
      { id: 'recep1', name: 'Maria Recepção', email: 'recepcao@clinica.com', role: 'receptionist' },
    ];
  });

  const [newUser, setNewUser] = useState<Partial<User>>({});
  const [showUserForm, setShowUserForm] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationConfig>(() => {
    const saved = localStorage.getItem('sorrisotech_notifications');
    return saved ? JSON.parse(saved) : {
      emailNotifications: true,
      smsNotifications: false,
      appointmentReminders: true,
      lowStockAlerts: true,
      paymentReminders: true,
      birthdayMessages: false,
    };
  });

  // Theme
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('sorrisotech_theme');
    return saved ? JSON.parse(saved) : {
      primaryColor: '#10b981',
      accentColor: '#059669',
      fontSize: 'medium',
      compactMode: false,
    };
  });

  const handleSaveClinic = () => {
    localStorage.setItem('sorrisotech_clinic_config', JSON.stringify(clinicConfig));
    toast.success('Configurações da clínica salvas com sucesso!');
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const user: User = {
      id: generateId(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as 'admin' | 'dentist' | 'receptionist',
    };

    const updatedUsers = [...users, user];
    setUsers(updatedUsers);
    localStorage.setItem('sorrisotech_users', JSON.stringify(updatedUsers));
    setNewUser({});
    setShowUserForm(false);
    toast.success('Usuário adicionado com sucesso!');
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === 'admin') {
      toast.error('Não é possível excluir o administrador principal');
      return;
    }

    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('sorrisotech_users', JSON.stringify(updatedUsers));
    toast.success('Usuário excluído com sucesso!');
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('sorrisotech_notifications', JSON.stringify(notifications));
    toast.success('Configurações de notificações salvas com sucesso!');
  };

  const handleSaveTheme = () => {
    localStorage.setItem('sorrisotech_theme', JSON.stringify(theme));
    toast.success('Tema salvo! Recarregue a página para aplicar as alterações.');
  };

  const handleBackup = () => {
    const data = {
      patients: localStorage.getItem('sorrisotech_patients'),
      appointments: localStorage.getItem('sorrisotech_appointments'),
      records: localStorage.getItem('sorrisotech_records'),
      treatments: localStorage.getItem('sorrisotech_treatments'),
      transactions: localStorage.getItem('sorrisotech_transactions'),
      stock: localStorage.getItem('sorrisotech_stock'),
      users: localStorage.getItem('sorrisotech_users'),
      config: localStorage.getItem('sorrisotech_clinic_config'),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-sorrisotech-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup gerado com sucesso!');
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        Object.keys(data).forEach(key => {
          if (data[key]) {
            localStorage.setItem(`sorrisotech_${key}`, data[key]);
          }
        });
        toast.success('Backup restaurado com sucesso! Recarregando...');
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        toast.error('Erro ao restaurar backup. Arquivo inválido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Personalize e configure o sistema</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="profile">
            <UserCircle className="h-4 w-4 mr-2" />
            Meu Perfil
          </TabsTrigger>
          <TabsTrigger value="clinic">
            <Building2 className="h-4 w-4 mr-2" />
            Clínica
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Shield className="h-4 w-4 mr-2" />
            Permissões
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="theme">
            <Palette className="h-4 w-4 mr-2" />
            Tema
          </TabsTrigger>
          <TabsTrigger value="backup">
            <Database className="h-4 w-4 mr-2" />
            Backup
          </TabsTrigger>
        </TabsList>

        {/* My Profile */}
        <TabsContent value="profile" className="space-y-6">
          {/* Profile info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-primary" />
                Dados do Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white text-2xl font-bold">
                  {profileData.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-lg">{profileData.name}</p>
                  <p className="text-sm text-muted-foreground">{profileData.email}</p>
                  <span className="inline-block mt-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                    {profileData.role === 'admin' ? 'Administrador' : profileData.role === 'dentist' ? 'Dentista' : 'Recepcionista'}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="profileName">Nome Completo *</Label>
                  <Input
                    id="profileName"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profileEmail">Email *</Label>
                  <Input
                    id="profileEmail"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="profileRole">Perfil de Acesso</Label>
                  <Select
                    value={profileData.role}
                    onValueChange={(value) => setProfileData({ ...profileData, role: value })}
                    disabled={currentUser?.role !== 'admin'}
                  >
                    <SelectTrigger id="profileRole">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="dentist">Dentista</SelectItem>
                      <SelectItem value="receptionist">Recepcionista</SelectItem>
                    </SelectContent>
                  </Select>
                  {currentUser?.role !== 'admin' && (
                    <p className="text-xs text-muted-foreground">Somente administradores podem alterar o perfil de acesso.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveProfile}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Perfil
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Alterar Senha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPwd">Senha Atual *</Label>
                <div className="relative">
                  <Input
                    id="currentPwd"
                    type={showCurrentPwd ? 'text' : 'password'}
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    placeholder="Digite sua senha atual"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPwd">Nova Senha *</Label>
                <div className="relative">
                  <Input
                    id="newPwd"
                    type={showNewPwd ? 'text' : 'password'}
                    value={passwordData.newPass}
                    onChange={(e) => setPasswordData({ ...passwordData, newPass: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordData.newPass.length > 0 && passwordData.newPass.length < 6 && (
                  <p className="text-xs text-destructive">A senha deve ter pelo menos 6 caracteres</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPwd">Confirmar Nova Senha *</Label>
                <div className="relative">
                  <Input
                    id="confirmPwd"
                    type={showConfirmPwd ? 'text' : 'password'}
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    placeholder="Repita a nova senha"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordData.confirm && passwordData.newPass !== passwordData.confirm && (
                  <p className="text-xs text-destructive">As senhas não coincidem</p>
                )}
                {passwordData.confirm && passwordData.newPass === passwordData.confirm && passwordData.confirm.length >= 6 && (
                  <p className="text-xs text-green-600">Senhas coincidem ✓</p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleChangePassword} variant="default">
                  <Lock className="mr-2 h-4 w-4" />
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinic Configuration */}
        <TabsContent value="clinic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Clínica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clinicName">Nome da Clínica *</Label>
                  <Input
                    id="clinicName"
                    value={clinicConfig.name}
                    onChange={(e) => setClinicConfig({ ...clinicConfig, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    value={clinicConfig.cnpj}
                    onChange={(e) => setClinicConfig({ ...clinicConfig, cnpj: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={clinicConfig.phone}
                    onChange={(e) => setClinicConfig({ ...clinicConfig, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={clinicConfig.email}
                    onChange={(e) => setClinicConfig({ ...clinicConfig, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço *</Label>
                  <Input
                    id="address"
                    value={clinicConfig.address}
                    onChange={(e) => setClinicConfig({ ...clinicConfig, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    value={clinicConfig.city}
                    onChange={(e) => setClinicConfig({ ...clinicConfig, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado *</Label>
                  <Input
                    id="state"
                    value={clinicConfig.state}
                    onChange={(e) => setClinicConfig({ ...clinicConfig, state: e.target.value })}
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP *</Label>
                  <Input
                    id="zipCode"
                    value={clinicConfig.zipCode}
                    onChange={(e) => setClinicConfig({ ...clinicConfig, zipCode: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveClinic} size="lg">
                  <Save className="mr-2 h-5 w-5" />
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Management */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gerenciar Usuários</h2>
            <Button onClick={() => setShowUserForm(!showUserForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </div>

          {showUserForm && (
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Novo Usuário</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="newUserName">Nome Completo *</Label>
                    <Input
                      id="newUserName"
                      value={newUser.name || ''}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newUserEmail">Email *</Label>
                    <Input
                      id="newUserEmail"
                      type="email"
                      value={newUser.email || ''}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newUserRole">Perfil de Acesso *</Label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value as any })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="dentist">Dentista</SelectItem>
                        <SelectItem value="receptionist">Recepcionista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowUserForm(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddUser}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Usuário
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Usuários Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-semibold text-lg">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <span className="inline-block mt-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                          {user.role === 'admin' ? 'Administrador' : user.role === 'dentist' ? 'Dentista' : 'Recepcionista'}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.id === 'admin'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions */}
        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permissões por Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-3">👨‍💼 Administrador</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>✓ Acesso total ao sistema</li>
                    <li>✓ Gerenciar usuários e permissões</li>
                    <li>✓ Visualizar e editar todos os módulos</li>
                    <li>✓ Configurar sistema e integrações</li>
                    <li>✓ Acessar relatórios financeiros</li>
                    <li>✓ Gerenciar estoque e notas fiscais</li>
                  </ul>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-3">👨‍⚕️ Dentista</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>✓ Acessar prontuários de pacientes</li>
                    <li>✓ Visualizar e editar agenda própria</li>
                    <li>✓ Registrar evoluções clínicas</li>
                    <li>✓ Criar e editar tratamentos</li>
                    <li>✓ Visualizar dashboard</li>
                    <li>✗ Sem acesso ao financeiro completo</li>
                    <li>✗ Sem acesso a configurações do sistema</li>
                  </ul>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-3">👩‍💼 Recepcionista</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>✓ Cadastrar e editar pacientes</li>
                    <li>✓ Gerenciar agenda de todos os dentistas</li>
                    <li>✓ Visualizar dashboard</li>
                    <li>✓ Registrar pagamentos básicos</li>
                    <li>✗ Sem acesso a prontuários completos</li>
                    <li>✗ Sem acesso a relatórios financeiros</li>
                    <li>✗ Sem acesso a configurações do sistema</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotif">Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">Enviar notificações importantes por email</p>
                  </div>
                  <Switch
                    id="emailNotif"
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsNotif">Notificações por SMS</Label>
                    <p className="text-sm text-muted-foreground">Enviar notificações por mensagem de texto</p>
                  </div>
                  <Switch
                    id="smsNotif"
                    checked={notifications.smsNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, smsNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="appointmentReminders">Lembretes de Consulta</Label>
                    <p className="text-sm text-muted-foreground">Enviar lembretes automáticos aos pacientes</p>
                  </div>
                  <Switch
                    id="appointmentReminders"
                    checked={notifications.appointmentReminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, appointmentReminders: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="lowStock">Alertas de Estoque Baixo</Label>
                    <p className="text-sm text-muted-foreground">Notificar quando materiais atingirem estoque mínimo</p>
                  </div>
                  <Switch
                    id="lowStock"
                    checked={notifications.lowStockAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, lowStockAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="paymentReminders">Lembretes de Pagamento</Label>
                    <p className="text-sm text-muted-foreground">Enviar lembretes de parcelas pendentes</p>
                  </div>
                  <Switch
                    id="paymentReminders"
                    checked={notifications.paymentReminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, paymentReminders: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="birthday">Mensagens de Aniversário</Label>
                    <p className="text-sm text-muted-foreground">Enviar mensagens automáticas de aniversário</p>
                  </div>
                  <Switch
                    id="birthday"
                    checked={notifications.birthdayMessages}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, birthdayMessages: checked })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveNotifications} size="lg">
                  <Save className="mr-2 h-5 w-5" />
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme */}
        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalização do Tema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Cor Primária</Label>
                  <div className="flex gap-3 items-center">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={theme.primaryColor}
                      onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                      className="w-20 h-12"
                    />
                    <Input
                      value={theme.primaryColor}
                      onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor">Cor de Destaque</Label>
                  <div className="flex gap-3 items-center">
                    <Input
                      id="accentColor"
                      type="color"
                      value={theme.accentColor}
                      onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                      className="w-20 h-12"
                    />
                    <Input
                      value={theme.accentColor}
                      onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fontSize">Tamanho da Fonte</Label>
                  <Select value={theme.fontSize} onValueChange={(value: any) => setTheme({ ...theme, fontSize: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeno</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compactMode">Modo Compacto</Label>
                    <p className="text-sm text-muted-foreground">Reduzir espaçamentos para mostrar mais informações</p>
                  </div>
                  <Switch
                    id="compactMode"
                    checked={theme.compactMode}
                    onCheckedChange={(checked) => setTheme({ ...theme, compactMode: checked })}
                  />
                </div>
              </div>

              <div className="rounded-lg border-2 border-dashed p-6 text-center">
                <Palette className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Preview do tema será aplicado após salvar e recarregar a página
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveTheme} size="lg">
                  <Save className="mr-2 h-5 w-5" />
                  Salvar Tema
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Backup e Restauração de Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border-2 border-dashed p-6">
                <Database className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="font-semibold text-center mb-2">Fazer Backup dos Dados</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Faça backup de todos os dados da clínica incluindo pacientes, consultas, prontuários, financeiro e estoque.
                </p>
                <div className="flex justify-center">
                  <Button onClick={handleBackup} size="lg">
                    <Download className="mr-2 h-5 w-5" />
                    Gerar Backup
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border-2 border-dashed p-6">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="font-semibold text-center mb-2">Restaurar Backup</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Restaure um backup anterior. <strong className="text-destructive">Atenção:</strong> todos os dados atuais serão substituídos.
                </p>
                <div className="flex justify-center">
                  <label htmlFor="restore-file">
                    <Button asChild size="lg">
                      <span>
                        <Upload className="mr-2 h-5 w-5" />
                        Selecionar Arquivo
                      </span>
                    </Button>
                  </label>
                  <input
                    id="restore-file"
                    type="file"
                    accept=".json"
                    onChange={handleRestore}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">Importante</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Faça backups regulares dos seus dados</li>
                      <li>• Guarde os arquivos de backup em local seguro</li>
                      <li>• Teste a restauração periodicamente</li>
                      <li>• Os backups incluem informações sensíveis dos pacientes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
