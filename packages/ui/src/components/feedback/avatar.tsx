import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@repo/utils/cn";
import { BaseComponentProps } from "../../types";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      variant: {
        default: "bg-muted",
        primary: "bg-primary",
        secondary: "bg-secondary",
        destructive: "bg-destructive",
        success: "bg-success",
        warning: "bg-warning",
        info: "bg-info",
      },
      size: {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
        "2xl": "h-20 w-20",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const avatarImageVariants = cva(
  "aspect-square h-full w-full",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
        xl: "text-lg",
        "2xl": "text-xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const avatarFallbackVariants = cva(
  "flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
        xl: "text-lg",
        "2xl": "text-xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants>,
    BaseComponentProps {
  as?: React.ElementType;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, variant, size, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(avatarVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Avatar.displayName = "Avatar";

export interface AvatarImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement>,
    VariantProps<typeof avatarImageVariants>,
    BaseComponentProps {}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <img
        ref={ref}
        className={cn(avatarImageVariants({ size, className }))}
        {...props}
      />
    );
  }
);

AvatarImage.displayName = "AvatarImage";

export interface AvatarFallbackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarFallbackVariants>,
    BaseComponentProps {
  delayMs?: number;
}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, size, delayMs = 600, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(avatarFallbackVariants({ size, className }))}
        style={{
          animationDelay: `${delayMs}ms`,
        }}
        {...props}
      />
    );
  }
);

AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback, avatarVariants, avatarImageVariants, avatarFallbackVariants }; 