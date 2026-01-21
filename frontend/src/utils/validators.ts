import { z } from 'zod';

// Email validation
export const emailSchema = z.string().email('Invalid email address');

// Password validation
export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters');

// Phone number validation (Polish format)
export const phoneSchema = z
  .string()
  .regex(/^(\+48)?[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}$/, 'Invalid phone number format');

// Name validation
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters');

// Price validation
export const priceSchema = z
  .number()
  .positive('Price must be positive')
  .max(1000000, 'Price is too high');

// Quantity validation
export const quantitySchema = z
  .number()
  .int('Quantity must be an integer')
  .positive('Quantity must be positive')
  .max(1000, 'Quantity is too high');

// Login form schema
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Register form schema
export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phoneNumber: phoneSchema,
  password: passwordSchema,
  confirmPassword: passwordSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Product form schema
export const productSchema = z.object({
  categoryId: z.number().int().positive(),
  name: z.string().min(1).max(150),
  description: z.string().max(1000).optional(),
  basePrice: priceSchema,
});

// Order line schema
export const orderLineSchema = z.object({
  productId: z.number().int().positive(),
  quantity: quantitySchema,
});

// Create order schema
export const createOrderSchema = z.object({
  pickupStoreId: z.number().int().positive('Please select a pickup store'),
  lines: z.array(orderLineSchema).min(1, 'Order must contain at least one product'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type CreateOrderFormData = z.infer<typeof createOrderSchema>;
