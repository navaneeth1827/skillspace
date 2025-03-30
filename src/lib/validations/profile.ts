
import * as z from "zod";

export const profileSchema = z.object({
  id: z.string(),
  full_name: z.string().min(1, "Full name is required"),
  title: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  hourly_rate: z.number().optional(),
  skills: z.array(z.string()).optional(),
  avatar_url: z.string().nullable().optional(),
  user_type: z.string().default("freelancer"),
  company_name: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
