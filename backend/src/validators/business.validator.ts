import { z } from 'zod';

export const updateBusinessSchema = z.object({
  name: z.string().min(2).optional(),
  gstin: z.string().min(15).max(15).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  category: z.string().optional(),
});
