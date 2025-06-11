
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ExportSectionProps {
  onExportCSV: () => void;
}

const ExportSection: React.FC<ExportSectionProps> = ({ onExportCSV }) => {
  return (
    <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
      <CardContent className="pt-6">
        <Button onClick={onExportCSV} className="w-full wealth-gradient">
          Esporta Dati CSV
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExportSection;
