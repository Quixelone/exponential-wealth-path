import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, TrendingUp, Play, Trash2, Plus, Check } from 'lucide-react';
import { Strategy } from '@/types/strategy';
import { useStrategiesManager } from '@/hooks/useStrategiesManager';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

interface StrategiesListProps {
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('it-IT', { 
    style: 'currency', 
    currency: 'EUR',
    maximumFractionDigits: 0 
  }).format(amount);
};

const StrategyCard: React.FC<{
  strategy: Strategy;
  isCurrent: boolean;
  onLoad: () => void;
  onActivate: () => void;
  onDelete: () => void;
  loading: boolean;
  isActive: boolean;
}> = ({ strategy, isCurrent, onLoad, onActivate, onDelete, loading, isActive }) => {
  return (
    <Card className={`border transition-all duration-200 hover:shadow-md ${
      isCurrent ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/30'
    }`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">{strategy.name}</h4>
                {isActive && (
                  <Badge variant="outline" className="text-xs text-green-600 border-green-500">
                    <Check className="h-3 w-3 mr-1" />
                    Attiva
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(strategy.created_at)}
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {strategy.config.dailyReturnRate.toFixed(3)}%
                </div>
              </div>
            </div>
            {isCurrent && (
              <Badge variant="default" className="text-xs">
                Attiva
              </Badge>
            )}
          </div>

          {/* Parametri */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Capitale:</span>
              <div className="font-medium">{formatCurrency(strategy.config.initialCapital)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Giorni:</span>
              <div className="font-medium">{strategy.config.timeHorizon}</div>
            </div>
            <div>
              <span className="text-muted-foreground">PAC:</span>
              <div className="font-medium">{formatCurrency(strategy.config.pacConfig.amount)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Frequenza:</span>
              <div className="font-medium capitalize">{strategy.config.pacConfig.frequency}</div>
            </div>
          </div>

          {/* Info aggiuntive */}
          <div className="text-xs text-muted-foreground">
            {Object.keys(strategy.dailyReturns).length} rendimenti personalizzati
          </div>

          {/* Azioni */}
          <div className="flex gap-2 pt-2 justify-between">
            <Button
              size="sm"
              variant={isCurrent ? "outline" : "default"}
              onClick={onActivate}
              disabled={loading}
              className={`h-8 text-xs ${isCurrent ? 'border-green-500 text-green-600' : ''}`}
            >
              <Play className="h-3 w-3 mr-1" />
              {isCurrent ? 'Attivata' : 'Attiva'}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={onLoad}
              disabled={loading}
              className="h-8 text-xs"
            >
              Modifica
            </Button>
            
            <Button
              size="sm"
              variant={isActive ? "outline" : "default"}
              onClick={onActivate}
              disabled={loading}
              className={`h-8 text-xs ${isActive ? 'border-green-500 text-green-600' : ''}`}
            >
              {isActive ? (
                <><Check className="h-3 w-3 mr-1" />Attiva</>
              ) : (<><Play className="h-3 w-3 mr-1" />Attiva</>)}
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  disabled={loading}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Elimina Strategia</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sei sicuro di voler eliminare la strategia "{strategy.name}"? 
                    Questa azione non può essere annullata.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Elimina
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StrategiesList: React.FC<StrategiesListProps> = ({ strategiesManager, loading }) => {
  const { strategies, currentStrategy, createNewStrategy, loadStrategy, activateStrategy, deleteStrategy, activeInCalculator } = strategiesManager;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Strategie Salvate
          </CardTitle>
          <Button
            size="sm"
            onClick={createNewStrategy}
            disabled={loading}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nuova
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {strategies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Nessuna strategia salvata</p>
              <p className="text-sm">Crea la tua prima strategia per iniziare</p>
            </div>
          ) : (
            strategies.map((strategy) => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                isCurrent={currentStrategy?.id === strategy.id}
                onLoad={() => {
                  console.log('🔄 Caricando strategia per modifica:', strategy.name);
                  loadStrategy(strategy);
                }}
                onActivate={() => activateStrategy(strategy)}
                onDelete={() => deleteStrategy(strategy.id)}
                isActive={activeInCalculator && currentStrategy?.id === strategy.id}
                loading={loading}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StrategiesList;