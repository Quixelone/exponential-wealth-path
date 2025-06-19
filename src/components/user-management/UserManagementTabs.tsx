
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageSquare } from 'lucide-react';
import UserStatsCards from './UserStatsCards';
import UsersTable from './UsersTable';
import NotificationTester from '@/components/NotificationTester';

interface UserData {
  id: string;
  email: string | null;
  role: string;
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
}

const UserManagementTabs = ({ users, onUpdateUserRole }: UserManagementTabsProps) => {
  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Gestione Utenti
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Test Notifiche
        </TabsTrigger>
      </TabsList>

      <TabsContent value="users">
        <div className="space-y-8">
          <UserStatsCards users={users} />
          <UsersTable users={users} onUpdateUserRole={onUpdateUserRole} />
        </div>
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationTester />
      </TabsContent>
    </Tabs>
  );
};

export default UserManagementTabs;
