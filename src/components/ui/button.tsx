import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2, Check, X } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex flex-row flex-nowrap items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-sm hover:shadow-md",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm hover:shadow-md",
        info: "bg-info text-info-foreground hover:bg-info/90 shadow-sm hover:shadow-md",
        gradient: "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/50 transition-all duration-300",
        soft: "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20",
        "soft-success": "bg-success/10 text-success hover:bg-success/20 border border-success/20",
        "soft-warning": "bg-warning/10 text-warning hover:bg-warning/20 border border-warning/20",
        "soft-danger": "bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20",
        glass: "backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 text-foreground hover:bg-white/20 dark:hover:bg-black/30 shadow-modern",
        premium: "gradient-primary text-white shadow-glow-primary hover:shadow-modern-lg animate-glow",
      },
      size: {
        default: "h-[var(--size-md)] px-[var(--spacing-md)] py-[var(--spacing-xs)]",
        sm: "h-[var(--size-sm)] rounded-[var(--radius-md)] px-[var(--spacing-sm)] text-xs",
        lg: "h-[var(--size-lg)] rounded-[var(--radius-md)] px-[var(--spacing-xl)] text-base",
        xl: "h-[var(--size-xl)] rounded-[var(--radius-lg)] px-[var(--spacing-2xl)] text-lg",
        icon: "h-[var(--size-md)] w-[var(--size-md)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  state?: 'idle' | 'loading' | 'success' | 'error'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    children,
    disabled,
    state = 'idle',
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button"

    // When asChild is true, Slot component expects only a single child
    // So we render children directly without any wrappers or extra elements
    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={disabled}
          {...props}
        >
          {children}
        </Comp>
      )
    }

    // Determine the current state (legacy support for loading prop)
    const currentState = loading ? 'loading' : state;
    const isDisabled = disabled || currentState === 'loading' || currentState === 'success';

    // Get state icon
    const getStateIcon = () => {
      switch (currentState) {
        case 'loading':
          return <Loader2 className="h-4 w-4 animate-spin" />;
        case 'success':
          return <Check className="h-4 w-4 animate-scale-in" />;
        case 'error':
          return <X className="h-4 w-4 animate-shake" />;
        default:
          return null;
      }
    };

    const stateIcon = getStateIcon();

    // Normal button rendering with loading, icons, etc.
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          currentState === 'loading' && "relative",
          currentState === 'success' && "bg-success hover:bg-success text-success-foreground",
          currentState === 'error' && "animate-shake"
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {stateIcon || (leftIcon && <span className="flex-shrink-0">{leftIcon}</span>)}
        <span className={cn(
          currentState === 'loading' && loadingText && "opacity-0",
          "transition-opacity duration-200"
        )}>
          {currentState === 'loading' && loadingText ? loadingText : children}
        </span>
        {!stateIcon && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
