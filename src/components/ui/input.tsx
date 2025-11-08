import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-[var(--radius-md)] border bg-background px-[var(--spacing-md)] py-[var(--spacing-xs)] text-base ring-offset-background transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default: "border-input focus-visible:ring-ring focus-visible:border-primary",
        success: "border-success/50 focus-visible:ring-success focus-visible:border-success",
        error: "border-destructive/50 focus-visible:ring-destructive focus-visible:border-destructive",
        warning: "border-warning/50 focus-visible:ring-warning focus-visible:border-warning",
        soft: "bg-primary/5 border-primary/20 focus-visible:border-primary/40 focus-visible:ring-primary/20",
        "soft-success": "bg-success/5 border-success/20 focus-visible:border-success/40 focus-visible:ring-success/20",
        "soft-warning": "bg-warning/5 border-warning/20 focus-visible:border-warning/40 focus-visible:ring-warning/20",
        "soft-danger": "bg-danger/5 border-danger/20 focus-visible:border-danger/40 focus-visible:ring-danger/20",
        glass: "backdrop-blur-lg bg-white/10 dark:bg-black/20 border-white/20 focus-visible:bg-white/20 dark:focus-visible:bg-black/30 focus-visible:ring-white/30",
        premium: "gradient-primary border-0 text-white placeholder:text-white/70 focus-visible:ring-white/50 shadow-glow-primary",
      },
      inputSize: {
        sm: "h-[var(--size-sm)] text-xs",
        default: "h-[var(--size-md)]",
        lg: "h-[var(--size-lg)] text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
