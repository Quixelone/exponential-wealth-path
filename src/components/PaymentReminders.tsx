import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Calendar, Trash2, Plus, MessageCircle, Phone, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentReminder {
  id: string;
  payment_day: number;
  frequency: string;
  amount: number | null;
  description: string | null;
  next_reminder_date: string;
  reminder_time: string;
  is_active: boolean;
}

interface NotificationSettings {
  whatsapp_number: string | null;
  telegram_chat_id: string | null;
  preferred_method: string | null;
  notifications_enabled: boolean;
}

const PaymentReminders = () => {
  const { user, userProfile } = useAuth();
  const [reminders, setReminders] = useState<PaymentReminder[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    whatsapp_number: null,
    telegram_chat_id: null,
    preferred_method: 'email',
    notifications_enabled: true
  });
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    payment_day: 1,
    frequency: 'monthly',
    amount: '',
    description: '',
    reminder_time: '09:00'
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchReminders();
      fetchNotificationSettings();
    }
  }, [user]);

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_reminders')
        .select('*')
        .order('next_reminder_date');

      if (error) {
        console.error('Error fetching reminders:', error);
        return;
      }

      setReminders(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
        return;
      }

      if (data) {
        setNotificationSettings({
          whatsapp_number: data.whatsapp_number,
          telegram_chat_id: data.telegram_chat_id,
          preferred_method: data.preferred_method,
          notifications_enabled: data.notifications_enabled
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const updateNotificationSettings = async (settings: Partial<NotificationSettings>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user?.id,
          ...notificationSettings,
          ...settings
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating settings:', error);
        toast({
          title: "Errore",
          description: "Impossibile aggiornare le impostazioni",
          variant: "destructive",
        });
        return;
      }

      setNotificationSettings(prev => ({ ...prev, ...settings }));
      toast({
        title: "Impostazioni aggiornate",
        description: "Le tue preferenze sono state salvate",
      });
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReminder = async () => {
    try {
      setLoading(true);
      
      // Calcola la prossima data di promemoria in base alla frequenza
      const today = new Date();
      let nextDate = new Date(today);
      
      switch (newReminder.frequency) {
        case 'daily':
          nextDate.setDate(today.getDate() + 1);
          break;
        case 'weekly':
          nextDate.setDate(today.getDate() + 7);
          break;
        case 'monthly':
          nextDate = new Date(today.getFullYear(), today.getMonth(), newReminder.payment_day);
          if (nextDate <= today) {
            nextDate.setMonth(nextDate.getMonth() + 1);
          }
          break;
        case 'quarterly':
          nextDate = new Date(today.getFullYear(), today.getMonth(), newReminder.payment_day);
          if (nextDate <= today) {
            nextDate.setMonth(nextDate.getMonth() + 3);
          }
          break;
        case 'yearly':
          nextDate = new Date(today.getFullYear(), today.getMonth(), newReminder.payment_day);
          if (nextDate <= today) {
            nextDate.setFullYear(nextDate.getFullYear() + 1);
          }
          break;
      }

      const { error } = await supabase
        .from('payment_reminders')
        .insert({
          user_id: user?.id,
          payment_day: newReminder.payment_day,
          frequency: newReminder.frequency,
          amount: newReminder.amount ? parseFloat(newReminder.amount) : null,
          description: newReminder.description || null,
          next_reminder_date: nextDate.toISOString().split('T')[0],
          reminder_time: newReminder.reminder_time
        });

      if (error) {
        console.error('Error adding reminder:', error);
        toast({
          title: "Errore",
          description: "Impossibile aggiungere il promemoria",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Promemoria aggiunto",
        description: "Il promemoria è stato creato con successo",
      });

      setNewReminder({ payment_day: 1, frequency: 'monthly', amount: '', description: '', reminder_time: '09:00' });
      setShowAddForm(false);
      fetchReminders();
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_reminders')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting reminder:', error);
        toast({
          title: "Errore",
          description: "Impossibile eliminare il promemoria",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Promemoria eliminato",
        description: "Il promemoria è stato rimosso",
      });

      fetchReminders();
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const toggleReminder = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_reminders')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) {
        console.error('Error updating reminder:', error);
        toast({
          title: "Errore",
          description: "Impossibile aggiornare il promemoria",
          variant: "destructive",
        });
        return;
      }

      fetchReminders();
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Giornaliera';
      case 'weekly': return 'Settimanale';
      case 'monthly': return 'Mensile';
      case 'quarterly': return 'Trimestrale';
      case 'yearly': return 'Annuale';
      default: return frequency;
    }
  };

  return (
    <div className="space-y-6">
      {/* Impostazioni Notifiche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Impostazioni Notifiche
          </CardTitle>
          <CardDescription>
            Configura come vuoi ricevere i promemoria per i pagamenti
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Notifiche Attive</Label>
              <p className="text-sm text-muted-foreground">
                Attiva o disattiva tutte le notifiche
              </p>
            </div>
            <Switch
              checked={notificationSettings.notifications_enabled}
              onCheckedChange={(checked) => 
                updateNotificationSettings({ notifications_enabled: checked })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Numero WhatsApp</Label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="whatsapp"
                  placeholder="+39 123 456 7890"
                  value={notificationSettings.whatsapp_number || ''}
                  onChange={(e) => setNotificationSettings(prev => ({ 
                    ...prev, 
                    whatsapp_number: e.target.value 
                  }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram">Chat ID Telegram</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telegram"
                  placeholder="123456789"
                  value={notificationSettings.telegram_chat_id || ''}
                  onChange={(e) => setNotificationSettings(prev => ({ 
                    ...prev, 
                    telegram_chat_id: e.target.value 
                  }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Metodo Preferito</Label>
            <Select
              value={notificationSettings.preferred_method || 'email'}
              onValueChange={(value) => setNotificationSettings(prev => ({ 
                ...prev, 
                preferred_method: value 
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => updateNotificationSettings(notificationSettings)}
            disabled={loading}
          >
            Salva Impostazioni
          </Button>
        </CardContent>
      </Card>

      {/* Lista Promemoria */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Promemoria Pagamenti
              </CardTitle>
              <CardDescription>
                Gestisci i tuoi promemoria per i versamenti
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Promemoria
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <Card className="mb-6 border-dashed">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Frequenza</Label>
                    <Select
                      value={newReminder.frequency}
                      onValueChange={(value) => setNewReminder(prev => ({ 
                        ...prev, 
                        frequency: value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Giornaliera</SelectItem>
                        <SelectItem value="weekly">Settimanale</SelectItem>
                        <SelectItem value="monthly">Mensile</SelectItem>
                        <SelectItem value="quarterly">Trimestrale</SelectItem>
                        <SelectItem value="yearly">Annuale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {['monthly', 'quarterly', 'yearly'].includes(newReminder.frequency) && (
                    <div className="space-y-2">
                      <Label>Giorno del Mese</Label>
                      <Select
                        value={newReminder.payment_day.toString()}
                        onValueChange={(value) => setNewReminder(prev => ({ 
                          ...prev, 
                          payment_day: parseInt(value) 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Orario Promemoria</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={newReminder.reminder_time}
                        onChange={(e) => setNewReminder(prev => ({ 
                          ...prev, 
                          reminder_time: e.target.value 
                        }))}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Importo (opzionale)</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newReminder.amount}
                      onChange={(e) => setNewReminder(prev => ({ 
                        ...prev, 
                        amount: e.target.value 
                      }))}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Descrizione</Label>
                    <Textarea
                      placeholder="Rata del piano..."
                      value={newReminder.description}
                      onChange={(e) => setNewReminder(prev => ({ 
                        ...prev, 
                        description: e.target.value 
                      }))}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button onClick={addReminder} disabled={loading}>
                    Salva Promemoria
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Annulla
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {reminders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Frequenza</TableHead>
                  <TableHead>Giorno</TableHead>
                  <TableHead>Orario</TableHead>
                  <TableHead>Importo</TableHead>
                  <TableHead>Prossimo Promemoria</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reminders.map((reminder) => (
                  <TableRow key={reminder.id}>
                    <TableCell>{getFrequencyLabel(reminder.frequency)}</TableCell>
                    <TableCell>
                      <div>
                        {['monthly', 'quarterly', 'yearly'].includes(reminder.frequency) ? (
                          <div className="font-medium">Giorno {reminder.payment_day}</div>
                        ) : (
                          <div className="font-medium">-</div>
                        )}
                        {reminder.description && (
                          <div className="text-sm text-muted-foreground">
                            {reminder.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {reminder.reminder_time || '09:00'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {reminder.amount ? `€${reminder.amount.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>{formatDate(reminder.next_reminder_date)}</TableCell>
                    <TableCell>
                      <Badge variant={reminder.is_active ? 'default' : 'secondary'}>
                        {reminder.is_active ? 'Attivo' : 'Disattivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Switch
                          checked={reminder.is_active}
                          onCheckedChange={(checked) => 
                            toggleReminder(reminder.id, checked)
                          }
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteReminder(reminder.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nessun promemoria configurato</p>
              <p className="text-sm">Aggiungi il tuo primo promemoria per iniziare</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentReminders;
