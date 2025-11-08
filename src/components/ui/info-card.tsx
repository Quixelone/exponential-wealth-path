import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const infoCardVariants = cva(
  "relative w-full rounded-[var(--radius-lg)] p-[var(--spacing-md)] transition-all duration-200 border",
  {
    variants: {
      variant: {
        default: "bg-card border-border hover:shadow-md",
        primary: "bg-primary/5 border-primary/20 text-primary hover:bg-primary/10",
        success: "bg-success/5 border-success/20 text-success hover:bg-success/10",
        warning: "bg-warning/5 border-warning/20 text-warning hover:bg-warning/10",
        danger: "bg-danger/5 border-danger/20 text-danger hover:bg-danger/10",
        info: "bg-info/5 border-info/20 text-info hover:bg-info/10",
        soft: "bg-primary/5 border-primary/10 hover:border-primary/20",
        glass: "glass-card hover:shadow-modern-lg",
        premium: "gradient-primary border-0 text-white shadow-glow-primary hover:shadow-modern-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface InfoCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof infoCardVariants> {
  icon?: LucideIcon
  title?: string
  description?: string
  iconPosition?: "left" | "top"
}

const InfoCard = React.forwardRef<HTMLDivElement, InfoCardProps>(
  (
    {
      className,
      variant,
      icon: Icon,
      title,
      description,
      iconPosition = "left",
      children,
      ...props
    },
    ref
  ) => {
    const isHorizontal = iconPosition === "left"

    return (
      <div
        ref={ref}
        className={cn(infoCardVariants({ variant }), className)}
        {...props}
      >
        <div
          className={cn(
            "flex items-start",
            isHorizontal ? "gap-[var(--spacing-md)]" : "flex-col gap-[var(--spacing-sm)]"
          )}
        >
          {Icon && (
            <div
              className={cn(
                "flex-shrink-0 flex items-center justify-center rounded-[var(--radius-lg)] p-[var(--spacing-sm)]",
                variant === "default" && "bg-primary/10",
                variant === "primary" && "bg-primary/20",
                variant === "success" && "bg-success/20",
                variant === "warning" && "bg-warning/20",
                variant === "danger" && "bg-danger/20",
                variant === "info" && "bg-info/20",
                variant === "soft" && "bg-primary/10",
                variant === "glass" && "bg-white/10 dark:bg-black/10",
                variant === "premium" && "bg-white/20"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5",
                  variant === "default" && "text-primary",
                  variant === "premium" && "text-white"
                )}
              />
            </div>
          )}
          <div className="flex-1 space-y-[var(--spacing-xs)]">
            {title && (
              <h4
                className={cn(
                  "font-semibold text-base leading-none",
                  variant === "premium" && "text-white"
                )}
              >
                {title}
              </h4>
            )}
            {description && (
              <p
                className={cn(
                  "text-sm leading-relaxed",
                  variant === "default" && "text-muted-foreground",
                  variant === "premium" && "text-white/90"
                )}
              >
                {description}
              </p>
            )}
            {children && <div className="mt-[var(--spacing-sm)]">{children}</div>}
          </div>
        </div>
      </div>
    )
  }
)
InfoCard.displayName = "InfoCard"

export { InfoCard, infoCardVariants }
