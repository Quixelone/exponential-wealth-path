
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings } from 'lucide-react';

const SettingsHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna alla Dashboard
            </Button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Impostazioni Sistema
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsHeader;
