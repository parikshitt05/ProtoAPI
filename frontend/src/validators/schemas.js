import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(60, "Max 60 characters"),
  description: z.string().max(200, "Max 200 characters").optional(),
});

export const resourceSchema = z.object({
  name: z
    .string()
    .min(1, "Resource name is required")
    .max(40, "Max 40 characters")
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores"),
  seedCount: z.coerce.number().int().min(0).max(50),
});
