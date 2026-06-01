import { z } from 'zod';

/** One banked focus session. `clean` is false if the session was ever broken. */
export const sessionSchema = z.object({
  id: z.string(),
  at: z.number(),
  minutes: z.number().int().nonnegative(),
  subject: z.string(),
  clean: z.boolean(),
});
export type Session = z.infer<typeof sessionSchema>;

export const DURATIONS = [15, 25, 45, 60] as const;
export const durationSchema = z.union([z.literal(15), z.literal(25), z.literal(45), z.literal(60)]);
export type Duration = z.infer<typeof durationSchema>;

export const STRICTNESS = ['gentle', 'normal', 'strict'] as const;
export const strictnessSchema = z.enum(STRICTNESS);
export type Strictness = z.infer<typeof strictnessSchema>;

export const THEMES = ['dark', 'light'] as const;
export const themeSchema = z.enum(THEMES);
export type Theme = z.infer<typeof themeSchema>;

/** Accent swatches. Electric green is the signature; the rest are alternatives. */
export const ACCENTS = ['#58e08c', '#5ce0d0', '#7d8be0', '#e0c34a', '#e0795a'] as const;
export const accentSchema = z.enum(ACCENTS);
export type Accent = z.infer<typeof accentSchema>;

export const settingsSchema = z.object({
  duration: durationSchema,
  strictness: strictnessSchema,
  theme: themeSchema,
  accent: accentSchema,
  showWhy: z.boolean(),
});
export type Settings = z.infer<typeof settingsSchema>;

/** The logged history and streak. `why` is the last-used intention, remembered. */
export const appStateSchema = z.object({
  sessions: z.array(sessionSchema),
  streak: z.number().int().nonnegative(),
  lastDay: z.string().nullable(),
  why: z.string(),
});
export type AppState = z.infer<typeof appStateSchema>;

/** Everything we persist, wrapped with a version for safe future migrations. */
export const persistedStateSchema = z.object({
  version: z.literal(1),
  settings: settingsSchema,
  app: appStateSchema,
});
export type PersistedState = z.infer<typeof persistedStateSchema>;

/** The session overlay's phase — a small discriminated union. */
export type SessionPhase = 'promise' | 'run' | 'done';

/** The result handed back to the store when a session is banked. */
export interface SessionResult {
  minutes: number;
  subject: string;
  clean: boolean;
}
