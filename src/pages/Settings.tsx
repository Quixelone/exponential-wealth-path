
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotificationTester from '@/components/NotificationTester';
import SettingsHeader from '@/components/settings/SettingsHeader';

const Settings = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento impostazioni...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <SettingsHeader />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Impostazioni Sistema</h1>
          <p className="text-muted-foreground">
            Configura e testa le notifiche, gestisci le preferenze del sistema
          </p>
        </div>

        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mb-6">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Test Notifiche WhatsApp
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Preferenze
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications">
            <NotificationTester />
          </TabsContent>

          <TabsContent value="preferences">
            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Preferenze Notifiche</h3>
              <p className="text-muted-foreground">
                Le preferenze delle notifiche verranno implementate in futuro.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
