import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@repo/utils/cn";
import { BaseComponentProps } from "../../types";

const boxVariants = cva("", {
  variants: {
    display: {
      block: "block",
      inline: "inline",
      "inline-block": "inline-block",
      flex: "flex",
      "inline-flex": "inline-flex",
      grid: "grid",
      "inline-grid": "inline-grid",
      none: "hidden",
    },
    position: {
      static: "static",
      relative: "relative",
      absolute: "absolute",
      fixed: "fixed",
      sticky: "sticky",
    },
    overflow: {
      visible: "overflow-visible",
      hidden: "overflow-hidden",
      scroll: "overflow-scroll",
      auto: "overflow-auto",
    },
    width: {
      auto: "w-auto",
      full: "w-full",
      screen: "w-screen",
      min: "w-min",
      max: "w-max",
      fit: "w-fit",
    },
    height: {
      auto: "h-auto",
      full: "h-full",
      screen: "h-screen",
      min: "h-min",
      max: "h-max",
      fit: "h-fit",
    },
  },
  defaultVariants: {
    display: "block",
    position: "static",
    overflow: "visible",
    width: "auto",
    height: "auto",
  },
});

export interface BoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof boxVariants>,
    BaseComponentProps {
  as?: React.ElementType;
}

const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ className, display, position, overflow, width, height, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(boxVariants({ display, position, overflow, width, height, className }))}
        {...props}
      />
    );
  }
);

Box.displayName = "Box";

export { Box, boxVariants }; 