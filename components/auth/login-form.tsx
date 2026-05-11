"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { loginSchema, type LoginFormInput } from "@/lib/auth/validation";
import { loginAction } from "@/services/auth-actions";

export function LoginForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<LoginFormInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: LoginFormInput) {
    setMessage(null);

    startTransition(() => {
      void loginAction(values).then((result) => {
        if (!result) {
          return;
        }

        setMessage(result.message ?? null);

        Object.entries(result.fieldErrors ?? {}).forEach(([field, error]) => {
          form.setError(field as keyof LoginFormInput, {
            message: error,
          });
        });
      });
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-300">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="aqua-input h-11 w-full px-3 text-sm"
          {...form.register("email")}
        />
        {form.formState.errors.email?.message ? (
          <p className="text-sm text-red-300">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-slate-300"
        >
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="aqua-input h-11 w-full px-3 text-sm"
          {...form.register("password")}
        />
        {form.formState.errors.password?.message ? (
          <p className="text-sm text-red-300">
            {form.formState.errors.password.message}
          </p>
        ) : null}
      </div>

      {message ? (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {message}
        </p>
      ) : null}

      <Button type="submit" className="h-11 w-full" disabled={isPending}>
        <LogIn className="size-4" aria-hidden="true" />
        {isPending ? "Connexion..." : "Se connecter"}
      </Button>

      <p className="text-center text-sm text-slate-400">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-medium text-sky-300 hover:text-sky-200">
          Creer un compte
        </Link>
      </p>
    </form>
  );
}
