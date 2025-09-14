import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, ShieldAlert, ShieldCheck, Users } from 'lucide-react';
import { useSecurity } from '@/hooks/useSecurity';

interface UserData {
  id: string;
  email: string | null;
  role: string;
  admin_role: string | null;
  first_name: string | null;
  last_name: string | null;
  last_login: string | null;
}

interface AdminRoleManagerProps {
  users: UserData[];
  onUpdateUserRole: (userId: string, role: string) => void;
  onRefresh: () => void;
}

const AdminRoleManager: React.FC<AdminRoleManagerProps> = ({ 
  users, 
  onUpdateUserRole, 
  onRefresh 
}) => {
  const { updateUserAdminRole } = useSecurity();

  const handleAdminRoleChange = async (userId: string, adminRole: string | null) => {
    await updateUserAdminRole(userId, adminRole as any);
    onRefresh();
  };

  const getRoleIcon = (adminRole: string | null) => {
    switch (adminRole) {
      case 'super_admin':
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case 'admin_full':
        return <ShieldCheck className="h-4 w-4 text-orange-500" />;
      case 'admin_readonly':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleBadgeVariant = (adminRole: string | null) => {
    switch (adminRole) {
      case 'super_admin': return 'destructive' as const;
      case 'admin_full': return 'secondary' as const;
      case 'admin_readonly': return 'default' as const;
      default: return 'outline' as const;
    }
  };

  const getRoleLabel = (adminRole: string | null) => {
    switch (adminRole) {
      case 'super_admin': return 'Super Admin';
      case 'admin_full': return 'Admin Completo';
      case 'admin_readonly': return 'Admin Sola Lettura';
      default: return 'Utente';
    }
  };

  const adminUsers = users.filter(user => user.role === 'admin' || user.admin_role);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Gestione Ruoli Amministratori
        </CardTitle>
        <CardDescription>
          Gestisci i privilegi amministrativi e monitora gli accessi ai dati sensibili
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Role Descriptions */}
          <div className="grid gap-3 md:grid-cols-3">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Admin Sola Lettura</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Può visualizzare dati utenti ma non modificarli. Tutti gli accessi sono loggati.
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-4 w-4 text-orange-500" />
                <span className="font-medium">Admin Completo</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Può visualizzare e modificare dati utenti. Accessi e modifiche sono loggati.
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="h-4 w-4 text-red-500" />
                <span className="font-medium">Super Admin</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Accesso completo inclusa cancellazione dati per compliance GDPR.
              </p>
            </div>
          </div>

          {/* Current Admins */}
          <div>
            <h4 className="font-medium mb-3">Amministratori Attuali ({adminUsers.length})</h4>
            {adminUsers.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nessun amministratore configurato</p>
            ) : (
              <div className="space-y-3">
                {adminUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getRoleIcon(user.admin_role)}
                      <div>
                        <p className="font-medium">
                          {user.first_name && user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : user.email
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge variant={getRoleBadgeVariant(user.admin_role)}>
                        {getRoleLabel(user.admin_role)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Select
                        value={user.admin_role || 'none'}
                        onValueChange={(value) => 
                          handleAdminRoleChange(user.id, value === 'none' ? null : value)
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Rimuovi Admin</SelectItem>
                          <SelectItem value="admin_readonly">Admin Sola Lettura</SelectItem>
                          <SelectItem value="admin_full">Admin Completo</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Regular Users to Promote */}
          <div>
            <h4 className="font-medium mb-3">Utenti Regolari</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {users
                .filter(user => user.role !== 'admin' && !user.admin_role)
                .slice(0, 10)
                .map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {user.first_name && user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user.email
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Promuovi ad Admin
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Conferma Promozione Admin</AlertDialogTitle>
                        <AlertDialogDescription>
                          Stai per assegnare privilegi amministrativi a {user.email}. 
                          Tutti gli accessi dell'utente ai dati sensibili saranno monitorati.
                          Scegli il livello di accesso appropriato.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-col space-y-2">
                        <div className="flex gap-2 w-full">
                          <AlertDialogAction
                            onClick={() => handleAdminRoleChange(user.id, 'admin_readonly')}
                            className="flex-1"
                          >
                            Admin Sola Lettura
                          </AlertDialogAction>
                          <AlertDialogAction
                            onClick={() => handleAdminRoleChange(user.id, 'admin_full')}
                            className="flex-1"
                          >
                            Admin Completo
                          </AlertDialogAction>
                        </div>
                        <AlertDialogCancel className="w-full">Annulla</AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminRoleManager;