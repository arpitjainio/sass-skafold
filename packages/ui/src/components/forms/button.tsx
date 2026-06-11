import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@repo/utils/cn";
import { Loader2 } from "lucide-react";

import { ButtonProps as BaseButtonProps } from "../../types";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium  transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
        danger:
          "bg-danger text-danger-foreground dark:bg-danger-900 dark:text-danger-50 hover:bg-danger/90",
        outline:
          "border border-input bg-white text-black hover:bg-background/10 hover:text-accent-foreground dark:bg-black dark:text-white",
        accent:
          "bg-accent text-accent-foreground dark:bg-accent-900 dark:text-accent-50 hover:bg-accent/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline dark:text-primary-50",
        success:
          "bg-success text-success-foreground dark:bg-success-900 dark:text-success-50 hover:bg-success/90",
        warning:
          "bg-warning text-warning-foreground dark:bg-warning-900 dark:text-warning-50 hover:bg-warning/90",
        info: "bg-info text-info-foreground dark:bg-info-900 dark:text-info-50 hover:bg-info/90",
      },
      size: {
        sm: "h-8 px-3 py-1.5 text-xs",
        md: "h-10 px-4 py-2.5 text-sm",
        lg: "h-12 px-6 py-3 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants>,
    BaseButtonProps {
  asChild?: boolean;
  className?: string;
  disabled?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
        onClick={props.onClick}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
