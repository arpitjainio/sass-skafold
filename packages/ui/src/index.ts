/**
 * UI Package - Main Index
 * 
 * This file exports all UI components and utilities for easy importing.
 * It serves as the single entry point for the UI package.
 */

// Design System
export { Heading, Text, Box, Container } from "@repo/design-system/atoms";

// UI Components
export { Badge, badgeVariants } from "./components/feedback/badge";
export { Alert, alertVariants } from "./components/feedback/alert";
export { Icon, iconVariants } from "./components/feedback/icon";
export { Skeleton, skeletonVariants } from "./components/feedback/skeleton";
export { Avatar, AvatarImage, AvatarFallback } from "./components/feedback/avatar";
export { Divider, dividerVariants } from "./components/layout/divider";

// Form Components
export { Button, buttonVariants } from "./components/forms/button";
export { Input, inputVariants } from "./components/forms/input";
export { Select, selectVariants } from "./components/forms/select";
export { Textarea, textareaVariants } from "./components/forms/textarea";
export { Switch, switchVariants } from "./components/forms/switch";
export { Checkbox, checkboxVariants } from "./components/forms/checkbox";

// Layout Components
export { Card, cardVariants } from "./components/layout/card";

// Legacy exports for backward compatibility
export { buttonVariants as buttonAtomVariants } from "./components/forms/button";

// Types
export type {
  BaseComponentProps,
  ButtonProps,
  CardProps,
  InputProps,
  TableProps,
  TableColumn,
  PaginationProps,
  ModalProps,
  SidebarProps,
  NavigationItem,
  BreadcrumbItem,
} from "./types"; 