const { z } = require("zod");

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(60),
  description: z.string().max(200).optional(),
});

const resourceSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  name: z
    .string()
    .min(1, "Resource name is required")
    .max(40)
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, underscores"),
  schemaDefinition: z.object({}).catchall(z.string()),
  seedCount: z.number().int().min(0).max(50).default(10),
});

module.exports = { registerSchema, loginSchema, projectSchema, resourceSchema };
