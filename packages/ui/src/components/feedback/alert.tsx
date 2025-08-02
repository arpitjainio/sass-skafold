import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@repo/utils/cn";
import { BaseComponentProps } from "../../types";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        danger: "border-danger/50 text-danger dark:border-danger [&>svg]:text-danger",
        success: "border-success/50 text-success dark:border-success [&>svg]:text-success",
        warning: "border-warning/50 text-warning dark:border-warning [&>svg]:text-warning",
        info: "border-info/50 text-info dark:border-info [&>svg]:text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants>,
    BaseComponentProps {
  as?: React.ElementType;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant, className }))}
        {...props}
      />
    );
  }
);

Alert.displayName = "Alert";

export { Alert, alertVariants }; 