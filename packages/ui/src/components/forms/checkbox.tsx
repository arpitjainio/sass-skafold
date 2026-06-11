"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@repo/utils/cn";
import { BaseComponentProps } from "../../types";

const checkboxVariants = cva(
  "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
  {
    variants: {
      variant: {
        default:
          "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary-900 dark:data-[state=checked]:text-primary-50",
        success:
          "data-[state=checked]:bg-success data-[state=checked]:text-success-foreground dark:data-[state=checked]:bg-success-900 dark:data-[state=checked]:text-success-50",
        warning:
          "data-[state=checked]:bg-warning data-[state=checked]:text-warning-foreground dark:data-[state=checked]:bg-warning-900 dark:data-[state=checked]:text-warning-50",
        danger:
          "data-[state=checked]:bg-danger data-[state=checked]:text-danger-foreground dark:data-[state=checked]:bg-danger-900 dark:data-[state=checked]:text-danger-50",
      },
      size: {
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-5 w-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface CheckboxProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof checkboxVariants>,
    BaseComponentProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      variant,
      size: checkboxSize,
      checked,
      onCheckedChange,
      ...props
    },
    ref,
  ) => {
    const [isChecked, setIsChecked] = React.useState(checked || false);

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked);
      }
    }, [checked]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.checked;
      setIsChecked(newValue);
      onCheckedChange?.(newValue);
    };

    return (
      <div className="relative">
        <input
          type="checkbox"
          ref={ref}
          checked={isChecked}
          onChange={handleChange}
          className={cn(
            checkboxVariants({ variant, size: checkboxSize, className }),
          )}
          data-state={isChecked ? "checked" : "unchecked"}
          {...props}
        />
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export { Checkbox, checkboxVariants };
