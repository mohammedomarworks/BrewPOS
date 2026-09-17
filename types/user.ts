export type UserRole = "Admin" | "Manager" | "Cashier" | "Staff";

export type Permission =
  | "manage_settings"
  | "manage_users"
  | "view_reports"
  | "manage_discounts"
  | "manage_inventory"
  | "manage_menu"
  | "access_pos"
  | "manage_orders";

export interface User {
  id: string; // e.g., "USR-001"
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  lastActiveAt: string;
}

export type UserInput = Omit<User, "id" | "createdAt" | "lastActiveAt"> & {
  id?: string;
};
