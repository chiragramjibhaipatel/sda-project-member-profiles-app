import { z } from "zod";

export const MemberProfileSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(3),
    email: z.string().min(3).email(),
    role: z.enum(["Founder", "Founding Member", "Member"]),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    _action: z.string().optional(),
  })
  .refine(
    ({ confirmPassword, password, _action }) => {
      if (_action === undefined) {
        return true;
      }
      return password === confirmPassword;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  );