import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Download, Trash2 } from 'lucide-react';

/**
 * Demo component showcasing button states
 * This component is for demonstration purposes only
 */
export function ButtonDemo() {
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleClick = () => {
    setButtonState('loading');
    
    // Simulate API call
    setTimeout(() => {
      // Randomly succeed or fail
      const success = Math.random() > 0.3;
      setButtonState(success ? 'success' : 'error');
      
      // Reset after showing state
      setTimeout(() => {
        setButtonState('idle');
      }, 2000);
    }, 1500);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Button States Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* State Demo */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Interactive States</h3>
          <div className="flex gap-3">
            <Button state={buttonState} onClick={handleClick}>
              Save Changes
            </Button>
            <Button 
              variant="outline" 
              state={buttonState === 'loading' ? 'loading' : 'idle'}
              onClick={handleClick}
            >
              Upload
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Current state: <span className="font-mono font-semibold">{buttonState}</span>
          </p>
        </div>

        {/* Loading States */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Loading States</h3>
          <div className="flex gap-3 flex-wrap">
            <Button loading loadingText="Salvando...">
              Salva
            </Button>
            <Button variant="secondary" loading>
              Caricamento
            </Button>
            <Button variant="outline" loading leftIcon={<Download />}>
              Download
            </Button>
          </div>
        </div>

        {/* Success States */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Success States</h3>
          <div className="flex gap-3 flex-wrap">
            <Button state="success">
              Salvato
            </Button>
            <Button variant="outline" state="success">
              Completato
            </Button>
          </div>
        </div>

        {/* Error States */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Error States</h3>
          <div className="flex gap-3 flex-wrap">
            <Button state="error" variant="destructive">
              Errore
            </Button>
            <Button state="error" variant="outline">
              Fallito
            </Button>
          </div>
        </div>

        {/* With Icons */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">With Icons</h3>
          <div className="flex gap-3 flex-wrap">
            <Button leftIcon={<Save />}>
              Salva
            </Button>
            <Button variant="outline" rightIcon={<Download />}>
              Download
            </Button>
            <Button variant="destructive" leftIcon={<Trash2 />}>
              Elimina
            </Button>
          </div>
        </div>

        {/* Variants */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Variants</h3>
          <div className="flex gap-3 flex-wrap">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="gradient">Gradient</Button>
          </div>
        </div>

        {/* Sizes */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Sizes</h3>
          <div className="flex gap-3 items-center flex-wrap">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
            <Button size="icon" variant="outline">
              <Save />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
