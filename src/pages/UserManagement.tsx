
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import UserManagementHeader from '@/components/user-management/UserManagementHeader';
import UserManagementTabs from '@/components/user-management/UserManagementTabs';

interface UserData {
  id: string;
  email: string | null;
  role: string;
  admin_role: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  last_login: string | null;
  login_count: number | null;
  created_at: string | null;
}

const UserManagement = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔍 UserManagement mounted - isAdmin:', isAdmin, 'authLoading:', authLoading);
    
    // SEMPLIFICATO: Solo un controllo dopo che l'auth è caricata
    if (!authLoading) {
      if (isAdmin === false) {
        console.log('🚪 User is not admin, redirecting');
        navigate('/');
      } else if (isAdmin === true) {
        console.log('✅ User is admin, fetching users');
        fetchUsers();
      }
    }
  }, [isAdmin, authLoading, navigate]);

  const fetchUsers = async () => {
    try {
      console.log('📊 Fetching users data...');
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching users:', error);
        toast({
          title: "Errore",
          description: "Impossibile caricare gli utenti",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Users data loaded successfully:', data?.length, 'users');
      setUsers(data || []);
    } catch (error) {
      console.error('💥 Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        console.error('Error updating role:', error);
        toast({
          title: "Errore",
          description: "Impossibile aggiornare il ruolo",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Ruolo aggiornato",
        description: "Il ruolo dell'utente è stato modificato con successo",
      });

      fetchUsers();
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const deleteUser = async (userId: string, userEmail: string) => {
    try {
      console.log('🗑️ Attempting to delete user:', userId);
      
      const { data, error } = await supabase.rpc('delete_user_safely', {
        target_user_id: userId
      });

      if (error) {
        console.error('❌ Error deleting user:', error);
        toast({
          title: "Errore",
          description: error.message || "Impossibile eliminare l'utente",
          variant: "destructive",
        });
        return;
      }

      if (data === true) {
        toast({
          title: "Utente eliminato",
          description: `L'utente ${userEmail} è stato eliminato con successo`,
        });
        fetchUsers();
      } else {
        toast({
          title: "Errore",
          description: "L'eliminazione dell'utente non è riuscita",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('💥 Unexpected error deleting user:', error);
      toast({
        title: "Errore",
        description: "Errore inaspettato durante l'eliminazione",
        variant: "destructive",
      });
    }
  };

  // SEMPLIFICATO: Solo loading se necessario
  if (authLoading || loading) {
    console.log('⏳ Showing loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Caricamento...</p>
        </div>
      </div>
    );
  }

  console.log('🎯 Rendering UserManagement page');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <UserManagementHeader />
      <div className="max-w-7xl mx-auto p-6">
      <UserManagementTabs 
        users={users} 
        onUpdateUserRole={updateUserRole}
        onDeleteUser={deleteUser}
        onRefresh={fetchUsers}
      />
      </div>
    </div>
  );
};

export default UserManagement;
