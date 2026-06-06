import { ReactNode } from "react";

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  disabled?: boolean;
  loading?: boolean;
}

export type CardProps = BaseComponentProps;

export interface InputProps extends BaseComponentProps {
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export interface TableProps extends BaseComponentProps {
  data: unknown[];
  columns: TableColumn[];
  sortable?: boolean;
  pagination?: PaginationProps;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: unknown) => ReactNode;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export interface SidebarProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  position?: "left" | "right";
}

export interface NavigationItem {
  label: string;
  href: string;
  icon?: ReactNode;
  children?: NavigationItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
} 
