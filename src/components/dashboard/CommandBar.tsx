import React, { useState, useEffect } from 'react';
import { Command, Plus, Edit3, Download, Settings, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CommandBarProps {
  onAddPAC?: () => void;
  onEditStrategy?: () => void;
  onExport?: () => void;
  onSettings?: () => void;
  className?: string;
}

export const CommandBar: React.FC<CommandBarProps> = ({
  onAddPAC,
  onEditStrategy,
  onExport,
  onSettings,
  className
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Command Bar */}
      <div className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "glass-card rounded-full px-4 py-3",
        "border border-border/50 shadow-2xl",
        "flex items-center gap-2",
        "animate-fade-in",
        className
      )}>
        {/* Search Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSearchOpen(true)}
          className="rounded-full gap-2 hover:bg-primary/10"
        >
          <Search className="h-4 w-4" />
          <span className="hidden md:inline text-xs">Cerca</span>
          <kbd className="hidden md:inline-flex items-center gap-1 rounded border border-border/50 bg-muted px-1.5 py-0.5 text-[10px] font-mono">
            ⌘K
          </kbd>
        </Button>

        <div className="w-px h-6 bg-border/50" />

        {/* Quick Actions */}
        {onAddPAC && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddPAC}
            className="rounded-full gap-2 hover:bg-primary/10"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline text-xs">PAC</span>
          </Button>
        )}

        {onEditStrategy && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEditStrategy}
            className="rounded-full gap-2 hover:bg-primary/10"
          >
            <Edit3 className="h-4 w-4" />
            <span className="hidden md:inline text-xs">Modifica</span>
          </Button>
        )}

        {onExport && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onExport}
            className="rounded-full gap-2 hover:bg-primary/10"
          >
            <Download className="h-4 w-4" />
            <span className="hidden md:inline text-xs">Esporta</span>
          </Button>
        )}

        {onSettings && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettings}
            className="rounded-full gap-2 hover:bg-primary/10"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline text-xs">Impostazioni</span>
          </Button>
        )}

        {/* Command Indicator */}
        <div className="hidden md:flex items-center gap-1.5 ml-2 px-3 py-1 rounded-full bg-primary/10 text-primary">
          <Command className="h-3 w-3" />
          <span className="text-[10px] font-mono font-semibold">COMMAND</span>
        </div>
      </div>

      {/* Search Modal (Simple placeholder) */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-20"
          onClick={() => setIsSearchOpen(false)}
        >
          <div 
            className="glass-card w-full max-w-2xl p-6 rounded-xl border border-border/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cerca strategie, operazioni, o impostazioni..."
                className="flex-1 bg-transparent outline-none text-lg"
                autoFocus
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Premi ESC per chiudere
            </p>
          </div>
        </div>
      )}
    </>
  );
};
