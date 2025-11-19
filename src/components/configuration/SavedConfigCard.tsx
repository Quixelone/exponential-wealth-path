
import React, { useState } from 'react';
import { AnimatedCard } from '@/components/ui/animated-card';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Calendar, TrendingUp, Edit, Trash2, Shield } from 'lucide-react';
import { SavedConfiguration } from '@/types/database';
import { formatCurrencyWhole } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { cn } from '@/lib/utils';

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
  const [isInsured, setIsInsured] = React.useState(savedConfig.is_insured || false);
  const [updatingInsurance, setUpdatingInsurance] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Swipe gesture for mobile
  const { swipeState, handlers } = useSwipeGesture({
    onSwipeLeft: () => setShowDeleteConfirm(true),
    onSwipeRight: () => onEdit(),
    threshold: 80,
  });

  const handleInsuranceToggle = async (checked: boolean) => {
    setUpdatingInsurance(true);
    try {
      const { error } = await supabase
        .from('investment_configs')
        .update({ is_insured: checked })
        .eq('id', savedConfig.id);

      if (error) throw error;

      setIsInsured(checked);
      toast.success(checked ? "✅ Strategia assicurata" : "Assicurazione rimossa");
    } catch (error: any) {
      if (error.message?.includes('unique')) {
        toast.error("Puoi assicurare solo una strategia alla volta");
      } else {
        toast.error("Errore nell'aggiornare l'assicurazione");
      }
    } finally {
      setUpdatingInsurance(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Swipe action indicators */}
      {swipeState.isSwiping && (
        <>
          <div
            className={cn(
              'absolute inset-y-0 left-0 flex items-center justify-start px-6 transition-opacity',
              swipeState.swipeDirection === 'right' ? 'opacity-100' : 'opacity-0'
            )}
            style={{ width: `${Math.min(swipeState.swipeDistance, 100)}px` }}
          >
            <Edit className="h-5 w-5 text-primary" />
          </div>
          <div
            className={cn(
              'absolute inset-y-0 right-0 flex items-center justify-end px-6 bg-destructive/10 transition-opacity',
              swipeState.swipeDirection === 'left' ? 'opacity-100' : 'opacity-0'
            )}
            style={{ width: `${Math.min(swipeState.swipeDistance, 100)}px` }}
          >
            <Trash2 className="h-5 w-5 text-destructive" />
          </div>
        </>
      )}

      <AnimatedCard 
        hoverEffect="lift" 
        className={cn(
          'border border-border hover:border-primary/50 transition-all duration-300 h-full flex flex-col touch-feedback',
          swipeState.isSwiping && 'shadow-lg'
        )}
        style={{
          transform: swipeState.isSwiping 
            ? `translateX(${swipeState.swipeDirection === 'left' ? -swipeState.swipeDistance : swipeState.swipeDistance}px)` 
            : 'translateX(0)',
          transition: swipeState.isSwiping ? 'none' : 'transform 0.3s ease-out',
        }}
        {...handlers}
      >
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
          <div className="flex items-center gap-2 ml-2">
            {isInsured && (
              <Badge variant="default" className="text-xs flex items-center gap-1 flex-shrink-0">
                <Shield className="h-3 w-3" />
                Assicurata
              </Badge>
            )}
            {isCurrent && (
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                Attuale
              </Badge>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs mb-4 flex-1">
          <div className="space-y-1">
            <span className="text-muted-foreground block">Capitale:</span>
            <div className="font-medium truncate">{formatCurrencyWhole(savedConfig.config.initialCapital, savedConfig.config.currency || 'EUR')}</div>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground block">Giorni:</span>
            <div className="font-medium">{savedConfig.config.timeHorizon}</div>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground block">PAC:</span>
            <div className="font-medium truncate">{formatCurrencyWhole(savedConfig.config.pacConfig.amount, savedConfig.config.currency || 'EUR')}</div>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground block">Frequenza:</span>
            <div className="font-medium capitalize truncate">{savedConfig.config.pacConfig.frequency}</div>
          </div>
        </div>

        {/* Insurance Toggle */}
        <div className="flex items-center justify-between py-2 mb-3 border-t border-b text-xs">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="font-medium">Assicura strategia</span>
          </div>
          <Switch
            checked={isInsured}
            onCheckedChange={handleInsuranceToggle}
            disabled={updatingInsurance || loading}
          />
        </div>

        {/* Footer */}
        <div className="pt-2 mt-auto">
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
                className="h-11 px-4 text-xs touch-target"
              >
                Carica
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onEdit}
                disabled={loading}
                className="h-11 w-11 p-0 touch-target"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-11 w-11 p-0 text-red-600 hover:text-red-700 touch-target"
                disabled={loading}
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </AnimatedCard>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina Configurazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare la configurazione "{savedConfig.name}"? 
              Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="touch-target">Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-red-600 hover:bg-red-700 touch-target"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SavedConfigCard;
