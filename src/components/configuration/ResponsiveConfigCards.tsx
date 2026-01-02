import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Edit, Trash2, Clock, Euro, TrendingUp } from 'lucide-react';
import { SavedConfiguration } from '@/types/database';
import { formatCurrency } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface ResponsiveConfigCardsProps {
  savedConfigs: SavedConfiguration[];
  onLoad: (config: SavedConfiguration) => void;
  onEdit: (config: SavedConfiguration) => void;
  onDelete: (configId: string) => void;
  currentConfigId: string | null;
  loading: boolean;
}

const ResponsiveConfigCards: React.FC<ResponsiveConfigCardsProps> = ({
  savedConfigs,
  onLoad,
  onEdit,
  onDelete,
  currentConfigId,
  loading
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-full overflow-hidden">
      {savedConfigs.map((config) => {
        const isCurrent = config.id === currentConfigId;
        
        return (
          <Card 
            key={config.id} 
            className={`relative overflow-hidden transition-all duration-200 hover:shadow-md ${
              isCurrent ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base font-semibold line-clamp-2 min-h-[2.5rem]">
                  {config.name}
                </CardTitle>
                {isCurrent && (
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    Attiva
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDate(config.created_at)}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Euro className="h-3 w-3" />
                    <span>Capitale</span>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(config.config.initialCapital, config.config.currency)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span>Rendimento</span>
                  </div>
                   <div className="font-medium">
                     {config.config.dailyReturnRate.toFixed(3)}%
                   </div>
                </div>
              </div>

              {/* PAC Info */}
              <div className="text-xs space-y-1">
                <div className="text-muted-foreground">PAC</div>
                <div className="font-medium">
                  {formatCurrency(config.config.pacConfig.amount, config.config.currency)} / {config.config.pacConfig.frequency}
                </div>
                <div className="text-muted-foreground">
                  Orizzonte: {config.config.timeHorizon} giorni
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2">
                  <Button
                    onClick={() => onLoad(config)}
                    variant={isCurrent ? "secondary" : "default"}
                    size="sm"
                    className="flex-1 h-8 text-xs inline-flex items-center justify-center flex-row flex-nowrap whitespace-nowrap"
                    disabled={loading || isCurrent}
                  >
                    <Play className="h-3 w-3 mr-1 shrink-0" />
                    <span>{isCurrent ? 'In uso' : 'Carica'}</span>
                  </Button>
                  <Button
                    onClick={() => onEdit(config)}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={loading}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full h-8 text-xs inline-flex items-center justify-center flex-row flex-nowrap whitespace-nowrap"
                      disabled={loading}
                    >
                      <Trash2 className="h-3 w-3 mr-1 shrink-0" />
                      <span>Elimina</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                      <AlertDialogDescription>
                        Sei sicuro di voler eliminare la configurazione "{config.name}"? 
                        Questa azione non può essere annullata.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annulla</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(config.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Elimina
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ResponsiveConfigCards;