"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { loginSchema, registerSchema } from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";

export type AuthActionState = {
  message?: string;
  fieldErrors?: Record<string, string>;
};

function formatFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }

  return fieldErrors;
}

export async function registerAction(input: unknown): Promise<AuthActionState> {
  const parsedInput = registerSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      message: "Verifie les informations d'inscription.",
      fieldErrors: formatFieldErrors(parsedInput.error),
    };
  }

  const { email, password } = parsedInput.data;
  const name = parsedInput.data.name || undefined;
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    return {
      message: "Un compte existe deja avec cette adresse email.",
      fieldErrors: {
        email: "Cette adresse email est deja utilisee.",
      },
    };
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await hashPassword(password),
    },
    select: {
      id: true,
    },
  });

  await createSession(user.id);
  redirect("/dashboard");
}

export async function loginAction(input: unknown): Promise<AuthActionState> {
  const parsedInput = loginSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      message: "Verifie tes identifiants.",
      fieldErrors: formatFieldErrors(parsedInput.error),
    };
  }

  const { email, password } = parsedInput.data;
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user?.passwordHash) {
    return {
      message: "Email ou mot de passe incorrect.",
    };
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);

  if (!passwordMatches) {
    return {
      message: "Email ou mot de passe incorrect.",
    };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
