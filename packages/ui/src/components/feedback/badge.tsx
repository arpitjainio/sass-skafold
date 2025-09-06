import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@repo/utils/cn";
import { BaseComponentProps } from "../../types";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground dark:bg-primary-900 dark:text-primary-50 hover:bg-primary/80",
        accent:
          "border-transparent bg-accent text-accent-foreground dark:bg-accent-900 dark:text-accent-50 hover:bg-accent/80",
        danger:
          "border-transparent bg-danger text-danger-foreground dark:bg-danger-900 dark:text-danger-50 hover:bg-danger/80",
        outline: "border-border text-foreground dark:text-background hover:bg-accent hover:text-accent-foreground",
        success:
          "border-transparent bg-success text-success-foreground dark:bg-success-900 dark:text-success-50 hover:bg-success/80",
        warning:
          "border-transparent bg-warning text-warning-foreground dark:bg-warning-900 dark:text-warning-50 hover:bg-warning/80",
        info:
          "border-transparent bg-info text-info-foreground dark:bg-info-900 dark:text-info-50 hover:bg-info/80",
      },
      size: {
        sm: "px-2.5 py-1 text-xs",
        md: "px-3 py-1.5 text-sm",
        lg: "px-4 py-2 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants>,
    BaseComponentProps {
  as?: React.ElementType;
  className?: string;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, as: Component = "div", children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants }; 