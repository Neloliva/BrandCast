import { z } from "zod";

export const PostOutputSchema = z.object({
  hook: z
    .string()
    .min(1)
    .describe("The opening line. Must stop the scroll."),
  body: z.string().min(1).describe("Main post content."),
  cta: z
    .string()
    .optional()
    .describe("Call to action, if natural for the platform."),
  hashtags: z
    .array(z.string().regex(/^#?[A-Za-z0-9_]+$/))
    .optional()
    .describe("Without leading # — formatted at render time."),
});

export type PostOutput = z.infer<typeof PostOutputSchema>;
