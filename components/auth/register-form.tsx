"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  registerSchema,
  type RegisterFormInput,
} from "@/lib/auth/validation";
import { registerAction } from "@/services/auth-actions";

export function RegisterForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<RegisterFormInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: RegisterFormInput) {
    setMessage(null);

    startTransition(() => {
      void registerAction(values).then((result) => {
        if (!result) {
          return;
        }

        setMessage(result.message ?? null);

        Object.entries(result.fieldErrors ?? {}).forEach(([field, error]) => {
          form.setError(field as keyof RegisterFormInput, {
            message: error,
          });
        });
      });
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-slate-300">
          Nom
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          className="aqua-input h-11 w-full px-3 text-sm"
          {...form.register("name")}
        />
        {form.formState.errors.name?.message ? (
          <p className="text-sm text-red-300">
            {form.formState.errors.name.message}
          </p>
        ) : null}
      </div>

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
          autoComplete="new-password"
          className="aqua-input h-11 w-full px-3 text-sm"
          {...form.register("password")}
        />
        {form.formState.errors.password?.message ? (
          <p className="text-sm text-red-300">
            {form.formState.errors.password.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-slate-300"
        >
          Confirmation
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          className="aqua-input h-11 w-full px-3 text-sm"
          {...form.register("confirmPassword")}
        />
        {form.formState.errors.confirmPassword?.message ? (
          <p className="text-sm text-red-300">
            {form.formState.errors.confirmPassword.message}
          </p>
        ) : null}
      </div>

      {message ? (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {message}
        </p>
      ) : null}

      <Button type="submit" className="h-11 w-full" disabled={isPending}>
        <UserPlus className="size-4" aria-hidden="true" />
        {isPending ? "Creation..." : "Creer le compte"}
      </Button>

      <p className="text-center text-sm text-slate-400">
        Deja inscrit ?{" "}
        <Link href="/login" className="font-medium text-sky-300 hover:text-sky-200">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
