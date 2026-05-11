import { createHmac, randomBytes } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  DEFAULT_SESSION_DURATION_DAYS,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/constants";

function getSessionDurationMs() {
  const configuredDays = Number(process.env.AUTH_SESSION_DAYS);
  const durationDays =
    Number.isFinite(configuredDays) && configuredDays > 0
      ? configuredDays
      : DEFAULT_SESSION_DURATION_DAYS;

  return durationDays * 24 * 60 * 60 * 1000;
}

function getSessionSecret() {
  const secret = process.env.NEXTAUTH_SECRET?.trim();

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXTAUTH_SECRET is required in production.");
  }

  return "aquapilot-development-session-secret";
}

function hashSessionToken(token: string) {
  return createHmac("sha256", getSessionSecret()).update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + getSessionDurationMs());

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: {
        tokenHash: hashSessionToken(token),
      },
    });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashSessionToken(token),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          createdAt: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });

    return null;
  }

  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
