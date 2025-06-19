
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users } from 'lucide-react';
import UserStatsCards from './UserStatsCards';
import UsersTable from './UsersTable';

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
    <div className="w-full">
      <div className="space-y-8">
        <UserStatsCards users={users} />
        <UsersTable users={users} onUpdateUserRole={onUpdateUserRole} />
      </div>
    </div>
  );
};

export default UserManagementTabs;
