import { z } from 'zod';

const PasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
})

export const MemberProfileSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(3),
    email: z.string().min(3).email(),
    role: z.enum(["Founder", "Founding Member", "Member"]),
    _action: z.string().optional(),
  });


export const MemberProfileSchemaWithPassword = MemberProfileSchema.merge(PasswordSchema).refine(
  ({ confirmPassword, password }) => password === confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);