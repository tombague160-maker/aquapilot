import { redirect } from "next/navigation";
import { Waves } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_50%_-12%,rgba(37,99,235,0.2),transparent_32rem),linear-gradient(180deg,#020617,#030712)] px-4 py-10 text-slate-100">
      <section className="w-full max-w-md rounded-lg border border-blue-500/25 bg-slate-950/82 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.46)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Waves className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium text-sky-300">AquaPilot</p>
            <h1 className="text-2xl font-semibold text-slate-50">
              Connexion
            </h1>
          </div>
        </div>
        <p className="mt-5 text-sm leading-6 text-slate-400">
          Connecte-toi pour acceder a ton espace prive de gestion
          d&apos;aquariums.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
