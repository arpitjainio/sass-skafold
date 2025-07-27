import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@repo/utils/cn";
import { BaseComponentProps } from "../../types";

const dividerVariants = cva(
  "shrink-0 bg-border",
  {
    variants: {
      orientation: {
        horizontal: "h-px w-full",
        vertical: "h-full w-px",
      },
      variant: {
        default: "bg-border",
        primary: "bg-primary",
        secondary: "bg-secondary",
        muted: "bg-muted",
        destructive: "bg-destructive",
        success: "bg-success",
        warning: "bg-warning",
        info: "bg-info",
      },
      size: {
        sm: "h-px",
        md: "h-0.5",
        lg: "h-1",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
      variant: "default",
      size: "sm",
    },
  }
);

export interface DividerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerVariants>,
    BaseComponentProps {
  as?: React.ElementType;
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className, orientation, variant, size, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={cn(dividerVariants({ orientation, variant, size, className }))}
        {...props}
      />
    );
  }
);

Divider.displayName = "Divider";

export { Divider, dividerVariants }; 