import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Shield, ShieldAlert, LineChart, Database } from 'lucide-react';
import UserStatsCards from './UserStatsCards';
import UsersTable from './UsersTable';
import SecurityDashboard from '@/components/security/SecurityDashboard';
import AdminRoleManager from '@/components/security/AdminRoleManager';
import UserStrategiesTable from './UserStrategiesTable';
import { StrategyDetailDialog } from './StrategyDetailDialog';
import { AdminBackupRestore } from './AdminBackupRestore';

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
  const [selectedStrategy, setSelectedStrategy] = useState<{
    configId: string;
    userId: string;
    strategyName: string;
    userName: string;
  } | null>(null);

  const handleViewStrategyDetails = (
    configId: string,
    userId: string,
    strategyName: string,
    userName: string
  ) => {
    setSelectedStrategy({ configId, userId, strategyName, userName });
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Gestione Utenti
          </TabsTrigger>
          <TabsTrigger value="strategies" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Strategie Utenti
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Sicurezza
          </TabsTrigger>
          <TabsTrigger value="admin-roles" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Ruoli Admin
          </TabsTrigger>
          <TabsTrigger value="backup-restore" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Ripristino Backup
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-8 mt-6">
          <UserStatsCards users={users} />
          <UsersTable users={users} onUpdateUserRole={onUpdateUserRole} onDeleteUser={onDeleteUser} />
        </TabsContent>

        <TabsContent value="strategies" className="mt-6">
          <UserStrategiesTable onViewDetails={handleViewStrategyDetails} />
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

        <TabsContent value="backup-restore" className="mt-6">
          <AdminBackupRestore />
        </TabsContent>
      </Tabs>

      {selectedStrategy && (
        <StrategyDetailDialog
          open={!!selectedStrategy}
          onOpenChange={(open) => !open && setSelectedStrategy(null)}
          configId={selectedStrategy.configId}
          userId={selectedStrategy.userId}
          strategyName={selectedStrategy.strategyName}
          userDisplayName={selectedStrategy.userName}
        />
      )}
    </div>
  );
};

export default UserManagementTabs;