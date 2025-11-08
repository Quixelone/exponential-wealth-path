import React from 'react';
import { ButtonDemo } from '@/components/ui/button-demo';
import { ToastDemo } from '@/components/ui/toast-demo';
import { Separator } from '@/components/ui/separator';

/**
 * UI Components Showcase Page
 * Demonstrates enhanced button states and toast notifications
 */
export default function UIDemo() {
  return (
    <div className="container mx-auto py-8 space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">UI Components</h1>
        <p className="text-muted-foreground">
          Showcasing enhanced button states and toast notifications with animations
        </p>
      </div>
      
      <Separator />
      
      <ButtonDemo />
      
      <Separator />
      
      <ToastDemo />
    </div>
  );
}
