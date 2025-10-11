import { z } from 'zod';

// Auth validation schemas
export const authSignUpSchema = z.object({
  email: z.string().email({ message: 'Email non valida' }).max(255, { message: 'Email troppo lunga' }),
  password: z.string().min(8, { message: 'Password deve essere di almeno 8 caratteri' }).max(100, { message: 'Password troppo lunga' }),
  confirmPassword: z.string(),
  firstName: z.string().trim().min(1, { message: 'Nome obbligatorio' }).max(50, { message: 'Nome troppo lungo' }),
  lastName: z.string().trim().min(1, { message: 'Cognome obbligatorio' }).max(50, { message: 'Cognome troppo lungo' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non coincidono",
  path: ["confirmPassword"],
});

export const authSignInSchema = z.object({
  email: z.string().email({ message: 'Email non valida' }).max(255),
  password: z.string().min(1, { message: 'Password richiesta' }),
});

export const authPasswordResetSchema = z.object({
  email: z.string().email({ message: 'Email non valida' }).max(255),
});

// Configuration validation schemas
export const investmentConfigSchema = z.object({
  name: z.string().trim().min(1, { message: 'Nome configurazione richiesto' }).max(100),
  initial_capital: z.number().positive({ message: 'Capitale iniziale deve essere positivo' }).max(1000000000),
  pac_amount: z.number().positive({ message: 'Importo PAC deve essere positivo' }).max(1000000),
  time_horizon: z.number().int().positive({ message: 'Orizzonte temporale deve essere positivo' }).max(10000),
  daily_return_rate: z.number().min(-100).max(100),
  pac_frequency: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  pac_custom_days: z.number().int().positive().optional().nullable(),
  pac_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data non valida' }),
  currency: z.string().length(3),
});

// User profile validation schemas
export const userProfileSchema = z.object({
  first_name: z.string().trim().min(1).max(50).optional().nullable(),
  last_name: z.string().trim().min(1).max(50).optional().nullable(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: 'Numero di telefono non valido' }).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
});

// Notification settings validation
export const notificationSettingsSchema = z.object({
  preferred_method: z.enum(['email', 'whatsapp', 'telegram']).optional().nullable(),
  whatsapp_number: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional().nullable(),
  telegram_chat_id: z.string().max(100).optional().nullable(),
  notifications_enabled: z.boolean(),
});

// Edge function request validation schemas
export const customSmtpAuthRequestSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100).optional(),
  type: z.enum(['signup', 'recovery', 'email_change', 'magic_link']),
  redirectTo: z.string().url().optional(),
});

export const sendNotificationRequestSchema = z.object({
  userId: z.string().uuid(),
  message: z.string().trim().min(1).max(1000),
  method: z.enum(['email', 'whatsapp', 'telegram']),
});
