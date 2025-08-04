import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@repo/utils/cn";
import { BaseComponentProps } from "../../types";

const boxVariants = cva(
  "block",
  {
    variants: {
      padding: {
        none: "p-0",
        sm: "p-2",
        md: "p-4",
        lg: "p-6",
        xl: "p-8",
        "2xl": "p-12",
      },
      margin: {
        none: "m-0",
        sm: "m-2",
        md: "m-4",
        lg: "m-6",
        xl: "m-8",
        "2xl": "m-12",
      },
      background: {
        none: "",
        default: "bg-background dark:bg-foreground",
        muted: "bg-muted",
        primary: "bg-primary dark:bg-primary-900",
        accent: "bg-accent dark:bg-accent-900",
        danger: "bg-danger dark:bg-danger-900",
        success: "bg-success dark:bg-success-900",
        warning: "bg-warning dark:bg-warning-900",
        info: "bg-info dark:bg-info-900",
      },
      border: {
        none: "",
        default: "border border-border",
        primary: "border border-primary",
        accent: "border border-accent",
        danger: "border border-danger",
        success: "border border-success",
        warning: "border border-warning",
        info: "border border-info",
      },
      rounded: {
        none: "",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      padding: "none",
      margin: "none",
      background: "none",
      border: "none",
      rounded: "none",
    },
  }
);

export interface BoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof boxVariants>,
    BaseComponentProps {
  as?: React.ElementType;
}

const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ className, padding, margin, background, border, rounded, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(boxVariants({ padding, margin, background, border, rounded, className }))}
        {...props}
      />
    );
  }
);

Box.displayName = "Box";

export { Box, boxVariants }; 