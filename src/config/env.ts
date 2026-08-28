import { z } from "zod";

try {
  process.loadEnvFile();
} catch {
}

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  API_PREFIX: z.string().min(1).default("api/v1"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL wajib diisi"),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET wajib minimal 32 karakter. Generate: openssl rand -base64 48"),
  JWT_EXPIRES_IN: z.string().default("24h"),

  ACCOUNT_ACTIVE_YEARS: z.coerce.number().int().positive().default(5),

  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().email(),
  SMTP_PASSWORD: z.string().min(1),
  SMTP_FROM_NAME: z.string().default("NutriGrow"),

  CORS_ORIGINS: z.string().default(""),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const detail = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  console.error(`Konfigurasi environment tidak valid:\n${detail}`);
  process.exit(1);
}

const raw = parsed.data;

export const env = {
  ...raw,
  isProduction: raw.NODE_ENV === "production",
  isDevelopment: raw.NODE_ENV === "development",
  corsOrigins: raw.CORS_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0),
} as const;

export type Env = typeof env;
