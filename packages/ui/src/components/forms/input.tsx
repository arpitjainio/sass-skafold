import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@repo/utils/cn";
import { BaseComponentProps } from "../../types";

const inputVariants = cva(
  "flex w-full rounded-md border bg-neutral-100 text-primary-950 dark:text-neutral-200 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors dark:bg-primary-500 dark:placeholder:text-neutral-200 dark:border-border",
  {
    variants: {
      variant: {
        default: "border-neutral-300 dark:border-neutral-600 focus-visible:border-ring dark:border-border dark:focus-visible:border-ring",
        error: "border-danger focus-visible:ring-danger dark:border-danger dark:focus-visible:ring-danger",
        success: "border-success focus-visible:ring-success dark:border-success dark:focus-visible:ring-success",
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
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants>,
    BaseComponentProps {
  error?: string;
  success?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size: inputSize, error, success, ...props }, ref) => {
    // Determine variant based on error/success state
    const inputVariant = error ? "error" : success ? "success" : variant;
    
    return (
      <div className="relative">
        <input
          className={cn(inputVariants({ variant: inputVariant, size: inputSize, className }))}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-danger">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants }; 