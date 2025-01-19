import { z } from "zod";

export const MemberPasswordSchema = z.object({
    handle: z.string(),
    hashedPassword: z.string(),
    needReset: z.boolean(),
});