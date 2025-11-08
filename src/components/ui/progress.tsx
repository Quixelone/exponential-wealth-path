import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "gradient"
  size?: "sm" | "md" | "lg"
  showValue?: boolean
  striped?: boolean
  animated?: boolean
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({
  className,
  value,
  variant = "default",
  size = "md",
  showValue = false,
  striped = false,
  animated = false,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  }

  const variantClasses = {
    default: "bg-primary",
    success: "bg-success shadow-glow-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-info",
    gradient: "bg-gradient-to-r from-primary to-secondary",
  }

  return (
    <div className="w-full">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-muted/30 backdrop-blur-sm",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full flex-1 transition-all duration-500 ease-out",
            variantClasses[variant],
            striped && "bg-[length:1rem_1rem]",
            striped &&
              "bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)]",
            animated && striped && "animate-shimmer"
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
      {showValue && (
        <div className="mt-1 text-right">
          <span className="text-xs font-medium text-muted-foreground">
            {value}%
          </span>
        </div>
      )}
    </div>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
