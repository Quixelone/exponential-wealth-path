import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings } from 'lucide-react';

const SettingsHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-card dark:bg-dashboard-card border-b border-border dark:border-dashboard-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4 min-w-0 flex-wrap">
            <Button
              variant="ghost"
              onClick={() => navigate('/app')}
              className="inline-flex items-center gap-2 shrink-0"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Torna alla Dashboard</span>
              <span className="sm:hidden">Indietro</span>
            </Button>
            <div className="h-6 w-px bg-border dark:bg-dashboard-border hidden sm:block"></div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground dark:text-white flex items-center gap-2">
              <Settings className="h-5 w-5 shrink-0 text-primary" />
              <span className="hidden sm:inline">Impostazioni Sistema</span>
              <span className="sm:hidden">Impostazioni</span>
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsHeader;
