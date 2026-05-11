import { prisma } from "@/lib/prisma";
import {
  getNoteTypeLabel,
  type NoteFilterValue,
} from "@/rules/note";

type RawNote = {
  id: string;
  type: string;
  title: string | null;
  content: string;
  notedAt: Date;
  photoUrl: string | null;
  tags: string[];
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type NoteEntry = {
  id: string;
  type: string;
  typeLabel: string;
  title: string;
  content: string;
  notedAt: string;
  notedAtValue: string;
  notedAtLabel: string;
  photoUrl: string | null;
  tags: string[];
  pinned: boolean;
  updatedAtLabel: string;
};

const noteSelect = {
  id: true,
  type: true,
  title: true,
  content: true,
  notedAt: true,
  photoUrl: true,
  tags: true,
  pinned: true,
  createdAt: true,
  updatedAt: true,
} as const;

function toDateInputValue(date: Date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function toNoteEntry(note: RawNote): NoteEntry {
  return {
    id: note.id,
    type: note.type,
    typeLabel: getNoteTypeLabel(note.type),
    title: note.title ?? "",
    content: note.content,
    notedAt: note.notedAt.toISOString(),
    notedAtValue: toDateInputValue(note.notedAt),
    notedAtLabel: note.notedAt.toLocaleDateString("fr-FR", {
      dateStyle: "medium",
    }),
    photoUrl: note.photoUrl,
    tags: note.tags,
    pinned: note.pinned,
    updatedAtLabel: note.updatedAt.toLocaleDateString("fr-FR", {
      dateStyle: "medium",
    }),
  };
}

function noteMatchesSearch(note: NoteEntry, search: string) {
  if (!search) {
    return true;
  }

  const normalizedSearch = search.toLowerCase();

  return [
    note.title,
    note.content,
    note.typeLabel,
    ...note.tags,
  ].some((value) => value.toLowerCase().includes(normalizedSearch));
}

export async function getAquariumNotes(
  userId: string,
  aquariumId: string,
  filters: {
    type: NoteFilterValue;
    search: string;
  }
) {
  const notes = await prisma.note.findMany({
    where: {
      userId,
      aquariumId,
      type: filters.type === "all" ? undefined : filters.type,
      aquarium: {
        userId,
        isArchived: false,
      },
    },
    orderBy: [{ pinned: "desc" }, { notedAt: "desc" }, { createdAt: "desc" }],
    select: noteSelect,
  });

  return notes
    .map(toNoteEntry)
    .filter((note) => noteMatchesSearch(note, filters.search));
}

export async function getAquariumNotesForAiContext(
  userId: string,
  aquariumId: string,
  take = 20
) {
  const notes = await prisma.note.findMany({
    where: {
      userId,
      aquariumId,
      aquarium: {
        userId,
        isArchived: false,
      },
    },
    orderBy: [{ pinned: "desc" }, { notedAt: "desc" }, { createdAt: "desc" }],
    take,
    select: {
      type: true,
      title: true,
      content: true,
      notedAt: true,
      tags: true,
    },
  });

  return notes.map((note) => ({
    type: getNoteTypeLabel(note.type),
    title: note.title,
    content: note.content,
    notedAt: note.notedAt.toISOString(),
    tags: note.tags,
  }));
}
