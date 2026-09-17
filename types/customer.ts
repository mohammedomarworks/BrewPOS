export type CustomerStatus = "Active" | "Inactive";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerWithStats extends Customer {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderAt?: string;
}

export type CustomerInput = Omit<Customer, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};
