import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@repo/utils/cn";
import { BaseComponentProps } from "../../types";

const textareaVariants = cva(
  "flex w-full rounded-md border bg-background dark:bg-foreground text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none",
  {
    variants: {
      variant: {
        default:
          "border-input focus-visible:border-ring dark:border-border dark:focus-visible:border-ring",
        error:
          "border-danger focus-visible:ring-danger dark:border-danger dark:focus-visible:ring-danger",
        success:
          "border-success focus-visible:ring-success dark:border-success dark:focus-visible:ring-success",
      },
      size: {
        sm: "px-3 py-2 text-xs min-h-[60px]",
        md: "px-4 py-3 text-sm min-h-[80px]",
        lg: "px-5 py-4 text-base min-h-[100px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface TextareaProps
  extends
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants>,
    BaseComponentProps {
  error?: string;
  success?: boolean;
  className?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, error, success, ...props }, ref) => {
    // Determine variant based on error/success state
    const textareaVariant = error ? "error" : success ? "success" : variant;

    return (
      <div className="relative">
        <textarea
          className={cn(
            textareaVariants({ variant: textareaVariant, size, className }),
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
