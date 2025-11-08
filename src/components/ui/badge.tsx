import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-sm",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-sm",
        outline: "text-foreground border-border hover:bg-accent/50",
        success:
          "border-transparent bg-success/10 text-success border-success/20 hover:bg-success/20 backdrop-blur-sm",
        warning:
          "border-transparent bg-warning/10 text-warning border-warning/20 hover:bg-warning/20 backdrop-blur-sm",
        danger:
          "border-transparent bg-danger/10 text-danger border-danger/20 hover:bg-danger/20 backdrop-blur-sm",
        info:
          "border-transparent bg-info/10 text-info border-info/20 hover:bg-info/20 backdrop-blur-sm",
        gradient:
          "border-transparent bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg transition-all duration-300",
        soft: "border-transparent bg-primary/10 text-primary hover:bg-primary/20 border-primary/20",
        "soft-success": "border-transparent bg-success/10 text-success hover:bg-success/20 border-success/20",
        "soft-warning": "border-transparent bg-warning/10 text-warning hover:bg-warning/20 border-warning/20",
        "soft-danger": "border-transparent bg-danger/10 text-danger hover:bg-danger/20 border-danger/20",
        glass: "backdrop-blur-lg bg-white/10 dark:bg-black/20 border-white/20 text-foreground hover:bg-white/20 dark:hover:bg-black/30",
        premium: "border-transparent gradient-primary text-white shadow-glow-primary hover:shadow-modern-lg animate-glow",
      },
      size: {
        sm: "px-[var(--spacing-xs)] py-[0.125rem] text-xs",
        md: "px-[var(--spacing-sm)] py-[0.125rem] text-xs",
        lg: "px-[var(--spacing-md)] py-[var(--spacing-xs)] text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
  pulse?: boolean
  icon?: React.ReactNode
}

function Badge({
  className,
  variant,
  size,
  dot,
  pulse,
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full bg-current",
            pulse && "animate-pulse"
          )}
        />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
