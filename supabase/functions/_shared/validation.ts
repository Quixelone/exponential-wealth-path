import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// Fetch BTC Price validation
export const fetchBtcPriceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').max(10),
});

// Send Notifications validation
export const sendNotificationsSchema = z.object({
  type: z.enum(['check_reminders', 'send_notification']),
  reminder_id: z.string().uuid().optional(),
});

// Custom SMTP Auth validation
export const smtpAuthSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100).optional(),
  type: z.enum(['signup', 'recovery', 'email_change', 'magic_link']),
  redirectTo: z.string().url().optional().or(z.literal('')),
}).refine(
  (data) => {
    if (data.type === 'signup' && !data.password) {
      return false;
    }
    return true;
  },
  { message: 'Password is required for signup', path: ['password'] }
);

export type FetchBtcPriceRequest = z.infer<typeof fetchBtcPriceSchema>;
export type SendNotificationsRequest = z.infer<typeof sendNotificationsSchema>;
export type SmtpAuthRequest = z.infer<typeof smtpAuthSchema>;
