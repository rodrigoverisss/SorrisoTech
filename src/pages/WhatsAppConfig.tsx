import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { MessageSquare, Send, Bell, AlertCircle } from 'lucide-react';
import { WhatsAppConfig } from '@/types';

const DEFAULT_CONFIG: WhatsAppConfig = {
  enabled: false,
  confirmationMessage: 'Olá {paciente}! Sua consulta foi agendada para {data} às {hora} com {dentista}. Aguardamos você!',
  reminderMessage: 'Olá {paciente}! Lembrete: você tem consulta amanhã ({data}) às {hora} com {dentista}. Confirme sua presença respondendo SIM.',
  returnMessage: 'Olá {paciente}! Está na hora de fazer sua limpeza anual. Entre em contato para agendar sua consulta!',
  reminderHoursBefore: 24,
};

export default function WhatsAppConfig() {
  const [config, setConfig] = useState<WhatsAppConfig>(() => {
    const saved = localStorage.getItem('sorrisotech_whatsapp_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const handleSave = () => {
    localStorage.setItem('sorrisotech_whatsapp_config', JSON.stringify(config));
    alert('Configurações do WhatsApp salvas com sucesso!');
  };

  const handleTest = () => {
    alert('Mensagem de teste enviada!\n\n' + config.confirmationMessage.replace('{paciente}', 'João Silva').replace('{data}', '30/03/2026').replace('{hora}', '14:00').replace('{dentista}', 'Dr. Silva'));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integração WhatsApp</h1>
        <p className="text-muted-foreground">Configure mensagens automáticas para pacientes</p>
      </div>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <MessageSquare className="h-6 w-6 text-green-600 mt-1" />
            <div>
              <h3 className="font-semibold text-green-900 mb-2">Integração com WhatsApp Business API</h3>
              <p className="text-sm text-green-700 mb-3">
                Para ativar o envio automático de mensagens via WhatsApp, é necessário configurar uma conta no WhatsApp Business API. 
                Esta é uma demonstração das funcionalidades disponíveis.
              </p>
              <p className="text-sm text-green-700">
                <strong>Variáveis disponíveis:</strong> {'{paciente}'}, {'{data}'}, {'{hora}'}, {'{dentista}'}, {'{procedimento}'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Status da Integração</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="enabled">Ativar WhatsApp</Label>
              <Switch
                id="enabled"
                checked={config.enabled}
                onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${config.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="font-medium">
                {config.enabled ? 'Integração Ativa' : 'Integração Desativada'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Confirmação de Consulta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirmationMessage">Mensagem de Confirmação</Label>
            <Textarea
              id="confirmationMessage"
              value={config.confirmationMessage}
              onChange={(e) => setConfig({ ...config, confirmationMessage: e.target.value })}
              rows={4}
              placeholder="Mensagem enviada quando uma consulta é agendada"
            />
            <p className="text-xs text-muted-foreground">
              Enviada automaticamente quando uma nova consulta é agendada
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Lembrete de Consulta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reminderHours">Enviar lembrete (horas antes)</Label>
            <Input
              id="reminderHours"
              type="number"
              value={config.reminderHoursBefore}
              onChange={(e) => setConfig({ ...config, reminderHoursBefore: parseInt(e.target.value) })}
              min={1}
              max={72}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminderMessage">Mensagem de Lembrete</Label>
            <Textarea
              id="reminderMessage"
              value={config.reminderMessage}
              onChange={(e) => setConfig({ ...config, reminderMessage: e.target.value })}
              rows={4}
              placeholder="Mensagem enviada como lembrete antes da consulta"
            />
            <p className="text-xs text-muted-foreground">
              Enviada {config.reminderHoursBefore} horas antes da consulta
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Aviso de Retorno
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="returnMessage">Mensagem de Retorno</Label>
            <Textarea
              id="returnMessage"
              value={config.returnMessage}
              onChange={(e) => setConfig({ ...config, returnMessage: e.target.value })}
              rows={4}
              placeholder="Mensagem para pacientes que precisam retornar"
            />
            <p className="text-xs text-muted-foreground">
              Enviada periodicamente para campanhas de retorno (limpeza anual, check-up, etc)
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={handleTest}>
          <Send className="mr-2 h-4 w-4" />
          Enviar Teste
        </Button>
        <Button onClick={handleSave} size="lg">
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
