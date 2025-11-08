import { toast as sonnerToast } from 'sonner';
import { CheckCircle2, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react';
import React from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface EnhancedToastOptions {
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Enhanced toast notifications with contextual icons and better visual feedback
 * Uses sonner under the hood with custom styling
 */
export const enhancedToast = {
  success: (options: EnhancedToastOptions) => {
    return sonnerToast.success(options.title, {
      description: options.description,
      duration: options.duration || 4000,
      icon: <CheckCircle2 className="h-5 w-5 text-success animate-scale-in" />,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
      classNames: {
        toast: 'group border-success/20 bg-success/5',
        title: 'text-success-foreground font-semibold',
        description: 'text-muted-foreground',
        actionButton: 'bg-success text-success-foreground hover:bg-success/90',
      },
    });
  },

  error: (options: EnhancedToastOptions) => {
    return sonnerToast.error(options.title, {
      description: options.description,
      duration: options.duration || 5000,
      icon: <XCircle className="h-5 w-5 text-destructive animate-shake" />,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
      classNames: {
        toast: 'group border-destructive/20 bg-destructive/5',
        title: 'text-destructive-foreground font-semibold',
        description: 'text-muted-foreground',
        actionButton: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
    });
  },

  warning: (options: EnhancedToastOptions) => {
    return sonnerToast.warning(options.title, {
      description: options.description,
      duration: options.duration || 4500,
      icon: <AlertCircle className="h-5 w-5 text-warning animate-pulse" />,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
      classNames: {
        toast: 'group border-warning/20 bg-warning/5',
        title: 'text-warning-foreground font-semibold',
        description: 'text-muted-foreground',
        actionButton: 'bg-warning text-warning-foreground hover:bg-warning/90',
      },
    });
  },

  info: (options: EnhancedToastOptions) => {
    return sonnerToast.info(options.title, {
      description: options.description,
      duration: options.duration || 4000,
      icon: <Info className="h-5 w-5 text-info animate-fade-in" />,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
      classNames: {
        toast: 'group border-info/20 bg-info/5',
        title: 'text-info-foreground font-semibold',
        description: 'text-muted-foreground',
        actionButton: 'bg-info text-info-foreground hover:bg-info/90',
      },
    });
  },

  loading: (options: EnhancedToastOptions) => {
    return sonnerToast.loading(options.title, {
      description: options.description,
      duration: Infinity, // Loading toasts should be dismissed manually
      icon: <Loader2 className="h-5 w-5 text-primary animate-spin" />,
      classNames: {
        toast: 'group border-primary/20 bg-primary/5',
        title: 'text-primary-foreground font-semibold',
        description: 'text-muted-foreground',
      },
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
      description?: string;
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
      description: options.description,
    });
  },

  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};

// Export for backward compatibility
export { enhancedToast as toast };
