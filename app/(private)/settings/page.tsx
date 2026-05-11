import { CalendarDays, Mail, ShieldCheck, UserRound } from "lucide-react";

import { requireUser } from "@/lib/auth/session";
import { logoutAction } from "@/services/auth-actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <section className="rounded-lg border border-cyan-100 bg-white p-6 shadow-sm shadow-cyan-950/5">
        <p className="text-sm font-medium text-cyan-700">Compte</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          Parametres
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Informations de session et controles de compte pour l&apos;utilisateur
          connecte.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="aqua-card p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
              <UserRound className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-slate-500">Nom</p>
              <p className="font-medium text-slate-950">
                {user.name ?? "Non renseigne"}
              </p>
            </div>
          </div>
        </article>

        <article className="aqua-card p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
              <Mail className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-medium text-slate-950">{user.email}</p>
            </div>
          </div>
        </article>

        <article className="aqua-card p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-slate-500">Protection</p>
              <p className="font-medium text-slate-950">Session active</p>
            </div>
          </div>
        </article>

        <article className="aqua-card p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-slate-100 p-2 text-slate-700">
              <CalendarDays className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-slate-500">Compte cree</p>
              <p className="font-medium text-slate-950">
                {user.createdAt.toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="aqua-surface p-6">
        <h2 className="text-xl font-semibold text-slate-950">Session</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          La deconnexion supprime la session en base et efface le cookie
          HTTP-only du navigateur.
        </p>
        <form action={logoutAction} className="mt-5">
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Se deconnecter
          </button>
        </form>
      </section>
    </div>
  );
}
