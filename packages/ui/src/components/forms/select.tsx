import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@repo/utils/cn";
import { BaseComponentProps } from "../../types";

const selectVariants = cva(
  "flex w-full rounded-md border bg-neutral-100 dark:bg-primary-500 text-primary-950 dark:text-neutral-200 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-neutral-300 dark:border-neutral-600 focus-visible:border-ring dark:border-border dark:focus-visible:border-ring",
        error:
          "border-danger focus-visible:ring-danger dark:border-danger dark:focus-visible:ring-danger",
        success:
          "border-success focus-visible:ring-success dark:border-success dark:focus-visible:ring-success",
      },
      size: {
        sm: "h-8 px-3 py-1.5 text-xs",
        md: "h-10 px-4 py-2.5 text-sm",
        lg: "h-12 px-5 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface SelectProps
  extends
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
    VariantProps<typeof selectVariants>,
    BaseComponentProps {
  error?: string;
  success?: boolean;
  className?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      variant,
      size: selectSize,
      error,
      success,
      children,
      ...props
    },
    ref,
  ) => {
    // Determine variant based on error/success state
    const selectVariant = error ? "error" : success ? "success" : variant;

    return (
      <div className="relative">
        <select
          className={cn(
            selectVariants({
              variant: selectVariant,
              size: selectSize,
              className,
            }),
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";

export { Select, selectVariants };
