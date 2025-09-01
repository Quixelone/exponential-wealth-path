
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrendingUp } from 'lucide-react';
import UserStatsCards from './UserStatsCards';
import UsersTable from './UsersTable';
import PortfolioOverview from './PortfolioOverview';

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
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Gestione Utenti
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Portfolio Overview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-8 mt-6">
          <UserStatsCards users={users} />
          <UsersTable users={users} onUpdateUserRole={onUpdateUserRole} />
        </TabsContent>
        
        <TabsContent value="portfolio" className="mt-6">
          <PortfolioOverview />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagementTabs;
