export type UserRole = "admin" | "user";
export type TxType = "expense" | "income";

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  currency: string;
  monthlyIncome: number;
  createdAt: string;
}

export interface ClientCategory {
  id: string;
  name: string;
  type: TxType;
  color: string;
  icon: string;
  monthlyLimit: number;
}

export interface ClientTransaction {
  id: string;
  category: ClientCategory | string;
  type: TxType;
  amount: number;
  description: string;
  date: string;
  tags: string[];
  recurring: boolean;
  createdAt: string;
}

export interface ClientBudget {
  id: string;
  month: number;
  year: number;
  totalLimit: number;
}

export interface ClientNotification {
  id: string;
  type: "budget_warning" | "budget_exceeded" | "info" | "welcome";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}
