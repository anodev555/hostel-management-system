import type { ReactNode } from "react";

export type NavItem = {
  title: string;
  url: string;
  icon?: ReactNode;
  resource?: string;
  action?: string;
};

export type NavSubItem = NavItem;

export type NavGroupItem = NavItem & {
  isActive?: boolean;

  items?: NavSubItem[];
};

export type OrgNavGroup = {
  label: string;

  items: NavGroupItem[];
};
