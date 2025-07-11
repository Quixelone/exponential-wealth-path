
import React from 'react';
import { Button } from '@/components/ui/button';
import { ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from '@/components/ui/ModernTooltip';
import { Undo, Redo } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UndoRedoControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => any;
  onRedo: () => any;
  className?: string;
}

const UndoRedoControls: React.FC<UndoRedoControlsProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  className = ''
}) => {
  const { toast } = useToast();

  const handleUndo = () => {
    const snapshot = onUndo();
    if (snapshot) {
      toast({
        title: "Modifica annullata",
        description: `Ripristinato: ${snapshot.description}`,
        duration: 2000,
      });
    }
  };

  const handleRedo = () => {
    const snapshot = onRedo();
    if (snapshot) {
      toast({
        title: "Modifica ripetuta",
        description: `Applicato: ${snapshot.description}`,
        duration: 2000,
      });
    }
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey && canUndo) {
          event.preventDefault();
          handleUndo();
        } else if ((event.key === 'y' || (event.key === 'z' && event.shiftKey)) && canRedo) {
          event.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo]);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <ModernTooltip>
        <ModernTooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={!canUndo}
            className="h-8 w-8 sm:h-8 sm:w-auto sm:px-2 p-0 sm:p-2 text-muted-foreground hover:text-primary disabled:opacity-50 min-h-[44px] sm:min-h-[32px]"
          >
            <Undo className="h-4 w-4" />
          </Button>
        </ModernTooltipTrigger>
        <ModernTooltipContent>
          <p>Annulla ultima modifica (Ctrl+Z)</p>
        </ModernTooltipContent>
      </ModernTooltip>

      <ModernTooltip>
        <ModernTooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={!canRedo}
            className="h-8 w-8 sm:h-8 sm:w-auto sm:px-2 p-0 sm:p-2 text-muted-foreground hover:text-primary disabled:opacity-50 min-h-[44px] sm:min-h-[32px]"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </ModernTooltipTrigger>
        <ModernTooltipContent>
          <p>Ripeti ultima modifica (Ctrl+Y)</p>
        </ModernTooltipContent>
      </ModernTooltip>
    </div>
  );
};

export default UndoRedoControls;
