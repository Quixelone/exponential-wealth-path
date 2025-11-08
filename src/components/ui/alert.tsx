import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-[var(--radius-lg)] border p-[var(--spacing-md)] transition-all duration-200 animate-fade-in [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-[var(--spacing-md)] [&>svg]:top-[var(--spacing-md)]",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border [&>svg]:text-foreground",
        destructive:
          "bg-destructive/10 border-destructive/50 text-destructive backdrop-blur-sm [&>svg]:text-destructive",
        success:
          "bg-success/10 border-success/50 text-success backdrop-blur-sm [&>svg]:text-success",
        warning:
          "bg-warning/10 border-warning/50 text-warning backdrop-blur-sm [&>svg]:text-warning",
        info:
          "bg-info/10 border-info/50 text-info backdrop-blur-sm [&>svg]:text-info",
        soft: "bg-primary/5 border-primary/20 text-primary [&>svg]:text-primary",
        "soft-success": "bg-success/5 border-success/20 text-success [&>svg]:text-success",
        "soft-warning": "bg-warning/5 border-warning/20 text-warning [&>svg]:text-warning",
        "soft-danger": "bg-danger/5 border-danger/20 text-danger [&>svg]:text-danger",
        glass: "backdrop-blur-lg bg-white/10 dark:bg-black/20 border-white/20 text-foreground [&>svg]:text-foreground",
        premium: "gradient-primary border-0 text-white shadow-glow-primary [&>svg]:text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
