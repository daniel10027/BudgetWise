import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  currency: z.string().min(2).max(5).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const categorySchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(["expense", "income"]),
  color: z.string().optional(),
  icon: z.string().optional(),
  monthlyLimit: z.number().min(0).optional(),
});

export const transactionSchema = z.object({
  category: z.string().min(1, "Category is required"),
  type: z.enum(["expense", "income"]),
  amount: z.number().positive("Amount must be greater than 0"),
  description: z.string().max(200).optional(),
  date: z.string().or(z.date()).optional(),
  tags: z.array(z.string()).optional(),
  recurring: z.boolean().optional(),
});

export const budgetSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
  totalLimit: z.number().min(0),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  currency: z.string().min(2).max(5).optional(),
  monthlyIncome: z.number().min(0).optional(),
});
