import { z } from 'zod'

export const messageSchema = z.object({
  content:
   z.string()
   .min(10)
   .max(300),
  createdAt: z.date().default(() => new Date()),
});