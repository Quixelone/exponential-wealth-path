import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const progressBarVariants = cva(
  "relative w-full overflow-hidden rounded-[var(--radius-full)] bg-muted transition-all duration-300",
  {
    variants: {
      size: {
        sm: "h-1.5",
        md: "h-2.5",
        lg: "h-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const progressFillVariants = cva(
  "h-full transition-all duration-500 ease-out rounded-[var(--radius-full)]",
  {
    variants: {
      variant: {
        default: "bg-primary",
        success: "bg-success",
        warning: "bg-warning",
        danger: "bg-danger",
        info: "bg-info",
        gradient: "gradient-primary",
        "gradient-success": "gradient-success",
        "gradient-warning": "gradient-warning",
        "gradient-danger": "gradient-danger",
        "gradient-info": "gradient-info",
      },
      animated: {
        true: "animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      animated: false,
    },
  }
)

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressBarVariants> {
  value: number
  max?: number
  variant?: "default" | "success" | "warning" | "danger" | "info" | "gradient" | "gradient-success" | "gradient-warning" | "gradient-danger" | "gradient-info"
  animated?: boolean
  showLabel?: boolean
  label?: string
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className,
      size,
      variant = "default",
      value,
      max = 100,
      animated = false,
      showLabel = false,
      label,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
      <div className="w-full space-y-[var(--spacing-xs)]">
        {showLabel && (
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>{label}</span>
            <span className="font-medium">{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          ref={ref}
          className={cn(progressBarVariants({ size }), className)}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          {...props}
        >
          <div
            className={cn(progressFillVariants({ variant, animated }))}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)
ProgressBar.displayName = "ProgressBar"

export { ProgressBar, progressBarVariants }
