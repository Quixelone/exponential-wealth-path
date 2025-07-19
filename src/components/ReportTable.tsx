import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, Currency } from '@/lib/utils';
import { InvestmentData } from '@/types/investment';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import RowEditDialog from './RowEditDialog';
import { toast } from '@/hooks/use-toast';

interface ReportTableProps {
  data: InvestmentData[];
  currency: Currency;
  onExportCSV?: () => void;
  onUpdateDailyReturnInReport?: (day: number, newReturn: number) => void;
  onUpdatePACInReport?: (day: number, newPAC: number) => void;
  onRemoveCustomReturn?: (day: number) => void;
  onRemovePACOverride?: (day: number) => void;
  defaultPACAmount?: number;
  investmentStartDate?: Date;
  currentConfigId?: string | null;
  currentConfigName?: string | null;
  onSaveToStrategy?: () => Promise<void>;
}

const ReportTable: React.FC<ReportTableProps> = ({
  data,
  currency,
  onRemoveCustomReturn,
  onRemovePACOverride
}) => {
  const [selectedItem, setSelectedItem] = useState<InvestmentData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const {
    updateDailyReturn,
    updateDailyReturnDirect, // NEW: Get direct update function
    updatePACForDay,
    updatePACForDayDirect, // NEW: Get direct update function
    currentConfigId,
    currentConfigName,
    updateCurrentConfiguration,
    config
  } = useInvestmentCalculator();

  const handleEditItem = (item: InvestmentData) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  const handleRemoveCustomReturn = (day: number) => {
    if (onRemoveCustomReturn) {
      onRemoveCustomReturn(day);
    }
  };

  const handleRemovePACOverride = (day: number) => {
    if (onRemovePACOverride) {
      onRemovePACOverride(day);
    }
  };

  const handleSaveToStrategy = async () => {
    if (currentConfigId) {
      try {
        console.log('🔄 ReportTable: Saving to strategy', currentConfigId);
        await updateCurrentConfiguration(currentConfigId, currentConfigName || 'Strategia');
        toast({
          title: "Strategia aggiornata",
          description: `La strategia "${currentConfigName}" è stata aggiornata con successo`,
        });
      } catch (error) {
        console.error('❌ ReportTable: Error saving strategy', error);
        toast({
          title: "Errore",
          description: "Impossibile aggiornare la strategia",
          variant: "destructive",
        });
      }
    } else {
      console.warn('⚠️ ReportTable: No current config ID to save to');
      toast({
        title: "Errore",
        description: "Nessuna strategia selezionata",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Giorno</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Capitale Iniziale</TableHead>
            <TableHead>PAC</TableHead>
            <TableHead>Capitale Post-PAC</TableHead>
            <TableHead>Ricavo Giorno</TableHead>
            <TableHead>Capitale Finale</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.day}>
              <TableCell className="font-medium">{row.day}</TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell>{formatCurrency(row.capitalBeforePAC, currency)}</TableCell>
              <TableCell>{formatCurrency(row.pacAmount, currency)}</TableCell>
              <TableCell>{formatCurrency(row.capitalAfterPAC, currency)}</TableCell>
              <TableCell>{formatCurrency(row.interestEarnedDaily, currency)}</TableCell>
              <TableCell>{formatCurrency(row.finalCapital, currency)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditItem(row)}
                    className="touch-target"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifica
                  </Button>
                  {row.isCustomReturn && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleRemoveCustomReturn(row.day)}
                      className="touch-target"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Rimuovi Rendimento
                    </Button>
                  )}
                  {row.isCustomPAC && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleRemovePACOverride(row.day)}
                      className="touch-target"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Rimuovi PAC
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <RowEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        item={selectedItem}
        currency={currency}
        onUpdateDailyReturn={updateDailyReturn}
        onUpdateDailyReturnDirect={updateDailyReturnDirect} // NEW: Pass direct update function
        onUpdatePAC={updatePACForDay}
        onUpdatePACDirect={updatePACForDayDirect} // NEW: Pass direct update function
        defaultPACAmount={config.pacConfig.amount}
        currentConfigId={currentConfigId}
        currentConfigName={currentConfigName}
        onSaveToStrategy={handleSaveToStrategy}
      />
    </div>
  );
};

export default ReportTable;
