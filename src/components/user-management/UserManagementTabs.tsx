import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Shield, ShieldAlert } from 'lucide-react';
import UserStatsCards from './UserStatsCards';
import UsersTable from './UsersTable';
import SecurityDashboard from '@/components/security/SecurityDashboard';
import AdminRoleManager from '@/components/security/AdminRoleManager';

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

interface UserManagementTabsProps {
  users: UserData[];
  onUpdateUserRole: (userId: string, newRole: string) => Promise<void>;
  onDeleteUser: (userId: string, userEmail: string) => Promise<void>;
  onRefresh: () => void;
}

const UserManagementTabs = ({ users, onUpdateUserRole, onDeleteUser, onRefresh }: UserManagementTabsProps) => {
  return (
    <div className="w-full">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Gestione Utenti
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Sicurezza
          </TabsTrigger>
          <TabsTrigger value="admin-roles" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Ruoli Admin
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-8 mt-6">
          <UserStatsCards users={users} />
          <UsersTable users={users} onUpdateUserRole={onUpdateUserRole} onDeleteUser={onDeleteUser} />
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <SecurityDashboard />
        </TabsContent>

        <TabsContent value="admin-roles" className="mt-6">
          <AdminRoleManager 
            users={users} 
            onUpdateUserRole={onUpdateUserRole}
            onRefresh={onRefresh}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagementTabs;