import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@repo/utils/cn";
import { BaseComponentProps } from "../../types";

const skeletonVariants = cva("animate-pulse rounded-md bg-muted", {
  variants: {
    variant: {
      default: "bg-muted dark:bg-muted-foreground",
      primary: "bg-primary/20 dark:bg-primary-900/20",
      accent: "bg-accent/20 dark:bg-accent-900/20",
      danger: "bg-danger/20 dark:bg-danger-900/20",
      success: "bg-success/20 dark:bg-success-900/20",
      warning: "bg-warning/20 dark:bg-warning-900/20",
      info: "bg-info/20 dark:bg-info-900/20",
    },
    size: {
      sm: "h-4",
      md: "h-6",
      lg: "h-8",
      xl: "h-12",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export interface SkeletonProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants>,
    BaseComponentProps {
  as?: React.ElementType;
  className?: string;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, size, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(skeletonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";

export { Skeleton, skeletonVariants };
