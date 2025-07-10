
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Calendar, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { SavedConfiguration } from '@/types/database';
import { formatCurrencyWhole } from '@/lib/utils';

interface SavedConfigCardProps {
  savedConfig: SavedConfiguration;
  onLoad: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isCurrent: boolean;
  loading: boolean;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const SavedConfigCard: React.FC<SavedConfigCardProps> = ({
  savedConfig,
  onLoad,
  onEdit,
  onDelete,
  isCurrent,
  loading,
}) => {
  return (
    <Card className="border border-gray-200 hover:border-primary/30 transition-colors h-full flex flex-col">
      <CardContent className="p-4 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm mb-2 truncate">{savedConfig.name}</h4>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{formatDate(savedConfig.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 flex-shrink-0" />
                <span>{savedConfig.config.dailyReturnRate.toFixed(3)}%</span>
              </div>
            </div>
          </div>
          {isCurrent && (
            <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
              Attuale
            </Badge>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs mb-4 flex-1">
          <div className="space-y-1">
            <span className="text-muted-foreground block">Capitale:</span>
            <div className="font-medium truncate">{formatCurrencyWhole(savedConfig.config.initialCapital)}</div>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground block">Giorni:</span>
            <div className="font-medium">{savedConfig.config.timeHorizon}</div>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground block">PAC:</span>
            <div className="font-medium truncate">{formatCurrencyWhole(savedConfig.config.pacConfig.amount)}</div>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground block">Frequenza:</span>
            <div className="font-medium capitalize truncate">{savedConfig.config.pacConfig.frequency}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-3 mt-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="text-xs text-muted-foreground flex-shrink-0">
              {Object.keys(savedConfig.dailyReturns).length} rendimenti personalizzati
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={onLoad}
                disabled={loading}
                className="h-8 px-3 text-xs"
              >
                Carica
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onEdit}
                disabled={loading}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    disabled={loading}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Elimina Configurazione</AlertDialogTitle>
                    <AlertDialogDescription>
                      Sei sicuro di voler eliminare la configurazione "{savedConfig.name}"? 
                      Questa azione non può essere annullata.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Elimina
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedConfigCard;
