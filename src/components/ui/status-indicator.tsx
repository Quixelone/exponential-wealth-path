import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusIndicatorVariants = cva(
  "inline-flex items-center gap-[var(--spacing-xs)] font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        default: "text-foreground",
        success: "text-success",
        warning: "text-warning",
        danger: "text-danger",
        info: "text-info",
        primary: "text-primary",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

const dotVariants = cva(
  "rounded-[var(--radius-full)] transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-foreground",
        success: "bg-success shadow-glow-success",
        warning: "bg-warning",
        danger: "bg-danger",
        info: "bg-info",
        primary: "bg-primary shadow-glow-primary",
      },
      size: {
        sm: "w-1.5 h-1.5",
        md: "w-2 h-2",
        lg: "w-2.5 h-2.5",
      },
      animate: {
        none: "",
        pulse: "animate-pulse",
        ping: "animate-ping",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      animate: "none",
    },
  }
)

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusIndicatorVariants> {
  animate?: "none" | "pulse" | "ping"
  showDot?: boolean
}

const StatusIndicator = React.forwardRef<HTMLDivElement, StatusIndicatorProps>(
  ({ className, variant, size, animate = "none", showDot = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(statusIndicatorVariants({ variant, size }), className)}
        {...props}
      >
        {showDot && (
          <span className="relative flex items-center justify-center">
            <span className={cn(dotVariants({ variant, size, animate: "none" }))} />
            {animate === "ping" && (
              <span
                className={cn(
                  dotVariants({ variant, size, animate: "ping" }),
                  "absolute"
                )}
              />
            )}
            {animate === "pulse" && (
              <span
                className={cn(
                  dotVariants({ variant, size, animate: "pulse" })
                )}
              />
            )}
          </span>
        )}
        <span>{children}</span>
      </div>
    )
  }
)
StatusIndicator.displayName = "StatusIndicator"

export { StatusIndicator, statusIndicatorVariants }
