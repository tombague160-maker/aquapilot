import { z } from "zod";

const optionalNameSchema = z
  .string()
  .trim()
  .max(80, "Le nom est trop long.")
  .refine((value) => value.length === 0 || value.length >= 2, {
    message: "Le nom doit contenir au moins 2 caracteres.",
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Adresse email invalide.")
    .max(255)
    .transform((email) => email.toLowerCase()),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caracteres.")
    .max(128, "Le mot de passe est trop long."),
});

export const registerSchema = loginSchema
  .extend({
    name: optionalNameSchema,
    confirmPassword: z.string().min(8, "Confirme le mot de passe."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.output<typeof loginSchema>;
export type LoginFormInput = z.input<typeof loginSchema>;
export type RegisterInput = z.output<typeof registerSchema>;
export type RegisterFormInput = z.input<typeof registerSchema>;
