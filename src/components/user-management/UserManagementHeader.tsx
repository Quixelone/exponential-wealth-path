
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';

const UserManagementHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna alla Dashboard
            </Button>
            <div className="h-6 w-px bg-border"></div>
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestione Utenti
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementHeader;
