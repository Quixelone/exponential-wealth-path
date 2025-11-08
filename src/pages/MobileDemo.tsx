import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { Smartphone, Trash2, Edit, RefreshCw, Info } from 'lucide-react';
import { enhancedToast } from '@/components/ui/enhanced-toast';
import { cn } from '@/lib/utils';

/**
 * Demo page for mobile optimizations
 * Showcases swipe gestures, pull-to-refresh, and bottom sheets
 */
export default function MobileDemo() {
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [cards, setCards] = useState([
    { id: 1, title: 'Strategia Bitcoin', color: 'bg-blue-500' },
    { id: 2, title: 'Strategia Ethereum', color: 'bg-purple-500' },
    { id: 3, title: 'Strategia DeFi', color: 'bg-green-500' },
  ]);

  // Pull to refresh
  const { pullState, handlers: pullHandlers } = usePullToRefresh({
    onRefresh: async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      enhancedToast.success({
        title: 'Aggiornato!',
        description: 'I dati sono stati ricaricati.',
      });
    },
    threshold: 80,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-6 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Smartphone className="h-8 w-8 text-primary" />
            Mobile Optimizations
          </h1>
          <p className="text-muted-foreground">
            Swipe gestures, pull-to-refresh, e bottom sheets nativi
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold">Su mobile:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Swipe left sulle card per eliminare</li>
                  <li>• Swipe right sulle card per modificare</li>
                  <li>• Trascina giù dall'alto per aggiornare</li>
                  <li>• Tutti i pulsanti sono &gt;= 44x44px</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Swipeable Cards Section */}
        <Card>
          <CardHeader>
            <CardTitle>Swipeable Cards</CardTitle>
          </CardHeader>
          <CardContent 
            className="space-y-3 relative"
            {...pullHandlers}
          >
            {/* Pull to refresh indicator */}
            {(pullState.isPulling || pullState.isRefreshing) && (
              <div
                className={cn(
                  'absolute top-0 left-0 right-0 flex items-center justify-center bg-primary/5 transition-all duration-200',
                  pullState.isRefreshing && 'py-3'
                )}
                style={{
                  height: pullState.isPulling ? `${pullState.pullDistance}px` : '48px',
                }}
              >
                <div className="flex items-center gap-2 text-primary">
                  {pullState.isRefreshing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="text-sm font-medium">Aggiornamento...</span>
                    </>
                  ) : (
                    <span className="text-sm font-medium">
                      {pullState.pullDistance > 60 ? 'Rilascia per aggiornare' : 'Trascina per aggiornare'}
                    </span>
                  )}
                </div>
              </div>
            )}

            {cards.map((card) => (
              <SwipeableCard
                key={card.id}
                card={card}
                onDelete={() => {
                  setCards(prev => prev.filter(c => c.id !== card.id));
                  enhancedToast.success({
                    title: 'Eliminato',
                    description: `${card.title} è stato eliminato.`,
                  });
                }}
                onEdit={() => {
                  enhancedToast.info({
                    title: 'Modifica',
                    description: `Modifica ${card.title}`,
                  });
                }}
              />
            ))}
          </CardContent>
        </Card>

        {/* Bottom Sheet Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Bottom Sheet</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setBottomSheetOpen(true)}
              className="w-full touch-target"
            >
              Apri Bottom Sheet
            </Button>
          </CardContent>
        </Card>

        {/* Touch Targets Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Touch Targets (≥ 44px)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <Button size="sm" className="touch-target">
                Button SM
              </Button>
              <Button size="default" className="touch-target">
                Button Default
              </Button>
              <Button size="lg" className="touch-target">
                Button LG
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tutti i pulsanti hanno almeno 44x44px per una facile interazione touch
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={bottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        title="Opzioni"
      >
        <div className="space-y-4">
          <Button className="w-full touch-target" variant="outline">
            Opzione 1
          </Button>
          <Button className="w-full touch-target" variant="outline">
            Opzione 2
          </Button>
          <Button className="w-full touch-target" variant="outline">
            Opzione 3
          </Button>
          <Button 
            className="w-full touch-target" 
            variant="destructive"
            onClick={() => setBottomSheetOpen(false)}
          >
            Chiudi
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}

// Swipeable Card Component
function SwipeableCard({ 
  card, 
  onDelete, 
  onEdit 
}: { 
  card: { id: number; title: string; color: string };
  onDelete: () => void;
  onEdit: () => void;
}) {
  const { swipeState, handlers } = useSwipeGesture({
    onSwipeLeft: onDelete,
    onSwipeRight: onEdit,
    threshold: 80,
  });

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Swipe action indicators */}
      {swipeState.isSwiping && (
        <>
          <div
            className={cn(
              'absolute inset-y-0 left-0 flex items-center justify-start px-6 bg-primary/10 transition-opacity',
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

      <div
        className={cn(
          'p-6 rounded-lg shadow-sm transition-all touch-feedback',
          card.color,
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
        <h3 className="text-lg font-semibold text-white">{card.title}</h3>
        <p className="text-sm text-white/80 mt-1">Swipe per azioni</p>
      </div>
    </div>
  );
}
