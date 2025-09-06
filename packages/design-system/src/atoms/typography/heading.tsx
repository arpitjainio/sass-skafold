import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@repo/utils/cn";
import { BaseComponentProps } from "../../types";

const headingVariants = cva(
  "font-heading font-bold tracking-tight",
  {
    variants: {
      level: {
        h1: "text-4xl md:text-5xl lg:text-6xl",
        h2: "text-3xl md:text-4xl lg:text-5xl",
        h3: "text-2xl md:text-3xl lg:text-4xl",
        h4: "text-xl md:text-2xl lg:text-3xl",
        h5: "text-lg md:text-xl lg:text-2xl",
        h6: "text-base md:text-lg lg:text-xl",
      },
      variant: {
        default: "text-black dark:text-white",
        muted: "text-muted-foreground dark:text-muted",
        primary: "text-primary dark:text-primary-50",
        accent: "text-accent-foreground dark:text-accent-50",
        danger: "text-danger dark:text-danger-50",
        success: "text-success dark:text-success-50",
        warning: "text-warning dark:text-warning-50",
        info: "text-info dark:text-info-50",
      },
    },
    defaultVariants: {
      level: "h1",
      variant: "default",
    },
  }
);

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants>,
    BaseComponentProps {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level, variant, as, ...props }, ref) => {
    const Component = as || level || "h1";
    
    return (
      <Component
        ref={ref}
        className={cn(headingVariants({ level, variant, className }))}
        {...props}
      />
    );
  }
);

Heading.displayName = "Heading";

export { Heading, headingVariants }; 