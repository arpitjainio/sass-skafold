import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@repo/utils/cn";
import { BaseComponentProps } from "../../types";

const iconVariants = cva(
  "inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "text-foreground",
        primary: "text-primary",
        accent: "text-accent-foreground",
        danger: "text-danger",
        success: "text-success",
        warning: "text-warning",
        info: "text-info",
        muted: "text-muted-foreground",
      },
      size: {
        xs: "w-3 h-3",
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
        xl: "w-8 h-8",
        "2xl": "w-10 h-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface IconProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof iconVariants>,
    BaseComponentProps {
  as?: React.ElementType;
  children?: React.ReactNode;
}

const Icon = React.forwardRef<HTMLDivElement, IconProps>(
  ({ className, variant, size, as: Component = "div", children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(iconVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Icon.displayName = "Icon";

export { Icon, iconVariants }; 