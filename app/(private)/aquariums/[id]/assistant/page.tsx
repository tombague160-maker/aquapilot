import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bot, Database, LockKeyhole, MessageSquare } from "lucide-react";

import { AquariumAssistantChat } from "@/components/assistant/aquarium-assistant-chat";
import { requireUser } from "@/lib/auth/session";
import { getUserAquariumById } from "@/services/aquarium-service";

export const dynamic = "force-dynamic";

type AssistantPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AssistantPage({ params }: AssistantPageProps) {
  const { id } = await params;
  const user = await requireUser();
  const aquarium = await getUserAquariumById(user.id, id);

  if (!aquarium) {
    notFound();
  }

  const isOpenAiConfigured = Boolean(process.env.OPENAI_API_KEY?.trim());

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <Link
        href={`/aquariums/${aquarium.id}`}
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-cyan-700"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Retour au detail
      </Link>

      <section className="flex flex-col gap-4 rounded-lg border border-cyan-100 bg-white p-6 shadow-sm shadow-cyan-950/5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-cyan-700">{aquarium.name}</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">
            Assistant IA
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Analyse contextualisee de l&apos;aquarium, des mesures, du vivant,
            des alertes, des routines, des notes et du score sante.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-800">
          <Bot className="size-4" aria-hidden="true" />
          {isOpenAiConfigured ? "OpenAI configure" : "Cle OpenAI manquante"}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="aqua-card p-5">
          <Database className="size-5 text-cyan-700" aria-hidden="true" />
          <h2 className="mt-3 text-base font-semibold text-slate-950">
            Contexte serveur
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Les donnees privees restent filtrees par utilisateur et aquarium.
          </p>
        </article>
        <article className="aqua-card p-5">
          <LockKeyhole className="size-5 text-cyan-700" aria-hidden="true" />
          <h2 className="mt-3 text-base font-semibold text-slate-950">
            Cle protegee
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            `OPENAI_API_KEY` est lue uniquement cote serveur, jamais exposee au
            client.
          </p>
        </article>
        <article className="aqua-card p-5">
          <MessageSquare className="size-5 text-cyan-700" aria-hidden="true" />
          <h2 className="mt-3 text-base font-semibold text-slate-950">
            Historique local
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Les conversations sont conservees dans ce navigateur, pas encore en
            base.
          </p>
        </article>
      </section>

      <AquariumAssistantChat
        aquariumId={aquarium.id}
        isConfigured={isOpenAiConfigured}
      />
    </div>
  );
}
