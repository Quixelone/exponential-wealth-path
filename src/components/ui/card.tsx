import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-[var(--radius-lg)] bg-card text-card-foreground transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border bg-card shadow-sm hover:shadow-md",
        outlined: "border-2 border-border hover:border-primary/50",
        elevated: "border-0 shadow-modern hover:shadow-modern-lg",
        glass: "glass-card hover:shadow-modern-lg",
        gradient: "border-0 bg-gradient-to-br from-primary/10 to-secondary/10 shadow-md hover:shadow-lg",
        interactive: "border bg-card shadow-sm hover:shadow-modern-lg hover:scale-[1.02] cursor-pointer active:scale-[0.98]",
        premium: "border-0 shadow-modern-lg hover:shadow-modern-xl bg-gradient-to-br from-card via-card to-primary/5 hover:shadow-glow-primary transition-all duration-300",
        hero: "border-0 shadow-modern-xl bg-gradient-to-br from-primary/5 via-card to-secondary/5 p-8 hover:shadow-glow-primary",
        soft: "border border-primary/10 bg-primary/5 hover:bg-primary/10 hover:border-primary/20 shadow-sm",
        "soft-success": "border border-success/10 bg-success/5 hover:bg-success/10 hover:border-success/20 shadow-sm",
        "soft-warning": "border border-warning/10 bg-warning/5 hover:bg-warning/10 hover:border-warning/20 shadow-sm",
        "soft-danger": "border border-danger/10 bg-danger/5 hover:bg-danger/10 hover:border-danger/20 shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-[var(--spacing-lg)]", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-[var(--spacing-lg)] pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-[var(--spacing-lg)] pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }
