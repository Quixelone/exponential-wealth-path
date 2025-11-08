import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex min-h-[80px] w-full rounded-[var(--radius-md)] border bg-background px-[var(--spacing-md)] py-[var(--spacing-xs)] text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-y",
  {
    variants: {
      variant: {
        default: "border-input focus-visible:border-primary focus-visible:ring-ring",
        success: "border-success/50 focus-visible:border-success focus-visible:ring-success/20",
        error: "border-destructive/50 focus-visible:border-destructive focus-visible:ring-destructive/20",
        warning: "border-warning/50 focus-visible:border-warning focus-visible:ring-warning/20",
        soft: "bg-primary/5 border-primary/20 focus-visible:border-primary/40 focus-visible:ring-primary/20",
        "soft-success": "bg-success/5 border-success/20 focus-visible:border-success/40 focus-visible:ring-success/20",
        "soft-warning": "bg-warning/5 border-warning/20 focus-visible:border-warning/40 focus-visible:ring-warning/20",
        "soft-danger": "bg-danger/5 border-danger/20 focus-visible:border-danger/40 focus-visible:ring-danger/20",
        glass: "backdrop-blur-lg bg-white/10 dark:bg-black/20 border-white/20 focus-visible:bg-white/20 dark:focus-visible:bg-black/30 focus-visible:ring-white/30",
        premium: "gradient-primary border-0 text-white placeholder:text-white/70 focus-visible:ring-white/50 shadow-glow-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }
