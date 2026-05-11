import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  ImageIcon,
  Plus,
  Search,
  Sparkles,
  Tags,
} from "lucide-react";

import { DeleteNoteButton } from "@/components/notes/delete-note-button";
import { NoteForm } from "@/components/notes/note-form";
import { requireUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import {
  getNoteFilter,
  getNoteSearch,
  noteFilterOptions,
} from "@/rules/note";
import { getUserAquariumById } from "@/services/aquarium-service";
import { getAquariumNotes, type NoteEntry } from "@/services/note-service";

export const dynamic = "force-dynamic";

type NotesPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    type?: string | string[];
    q?: string | string[];
  }>;
};

function buildNotesHref(aquariumId: string, type: string, search: string) {
  const params = new URLSearchParams();

  if (type !== "all") {
    params.set("type", type);
  }

  if (search) {
    params.set("q", search);
  }

  const query = params.toString();

  return `/aquariums/${aquariumId}/notes${query ? `?${query}` : ""}`;
}

function NoteCard({
  aquariumId,
  note,
}: {
  aquariumId: string;
  note: NoteEntry;
}) {
  const displayTitle = note.title || "Note sans titre";

  return (
    <article className="aqua-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-cyan-200 bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-800">
              {note.typeLabel}
            </span>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
              {note.notedAtLabel}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-slate-950">
            {displayTitle}
          </h3>
        </div>
        <DeleteNoteButton noteId={note.id} noteTitle={displayTitle} />
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
        {note.content}
      </p>

      {note.photoUrl ? (
        <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={note.photoUrl}
            alt=""
            className="max-h-96 w-full object-cover"
          />
        </div>
      ) : null}

      {note.tags.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
            >
              <Tags className="size-3" aria-hidden="true" />
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <details className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <summary className="cursor-pointer text-sm font-medium text-cyan-800">
          Modifier cette note
        </summary>
        <div className="mt-4">
          <NoteForm aquariumId={aquariumId} note={note} />
        </div>
      </details>

      <p className="mt-4 text-xs text-slate-500">
        Derniere mise a jour : {note.updatedAtLabel}
      </p>
    </article>
  );
}

export default async function NotesPage({
  params,
  searchParams,
}: NotesPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const typeFilter = getNoteFilter(query.type);
  const search = getNoteSearch(query.q);
  const user = await requireUser();
  const aquarium = await getUserAquariumById(user.id, id);

  if (!aquarium) {
    notFound();
  }

  const notes = await getAquariumNotes(user.id, aquarium.id, {
    type: typeFilter,
    search,
  });

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
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Notes</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Garde les observations, problemes, idees et comportements utiles
            relies a cet aquarium.
          </p>
        </div>
        <a
          href="#new-note"
          className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 text-sm font-medium text-white transition-colors hover:bg-cyan-800"
        >
          <Plus className="size-4" aria-hidden="true" />
          Nouvelle note
        </a>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <article className="aqua-card p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
              <Search className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Recherche
              </h2>
              <p className="text-sm text-slate-500">
                Cherche dans les titres, contenus, types et tags.
              </p>
            </div>
          </div>
          <form method="get" className="mt-5 flex flex-col gap-3 sm:flex-row">
            {typeFilter !== "all" ? (
              <input type="hidden" name="type" value={typeFilter} />
            ) : null}
            <input
              name="q"
              defaultValue={search}
              placeholder="Recherche une note..."
              className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
            />
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              <Search className="size-4" aria-hidden="true" />
              Rechercher
            </button>
          </form>
        </article>

        <article className="aqua-card p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
              <FileText className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Filtres</h2>
              <p className="text-sm text-slate-500">Trie par type de note.</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {noteFilterOptions.map((option) => (
              <Link
                key={option.value}
                href={buildNotesHref(aquarium.id, option.value, search)}
                className={cn(
                  "inline-flex h-9 items-center rounded-lg border px-3 text-sm font-medium transition-colors",
                  typeFilter === option.value
                    ? "border-cyan-700 bg-cyan-700 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-lg border border-cyan-100 bg-cyan-50/60 p-5">
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-white p-2 text-cyan-700">
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Contexte IA pret
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Les notes sont structurees par type, date et tags pour etre
              reinjectees plus tard dans l&apos;assistant contextualise.
            </p>
          </div>
        </div>
      </section>

      <section id="new-note" className="scroll-mt-24">
        <NoteForm aquariumId={aquarium.id} />
      </section>

      <section className="aqua-surface p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-700">
              {notes.length} note(s)
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Historique
            </h2>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
            <ImageIcon className="size-4" aria-hidden="true" />
            Photo par URL
          </span>
        </div>

        {notes.length > 0 ? (
          <div className="mt-5 grid gap-4">
            {notes.map((note) => (
              <NoteCard key={note.id} aquariumId={aquarium.id} note={note} />
            ))}
          </div>
        ) : (
          <div className="mt-5 flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-cyan-200 bg-cyan-50/40 p-6 text-center">
            <FileText className="size-10 text-cyan-700" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-semibold text-slate-950">
              Aucune note trouvee
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
              Ajoute une note ou ajuste la recherche et le filtre selectionnes.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
