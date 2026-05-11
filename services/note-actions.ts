"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { noteFormSchema, type NoteFormValues } from "@/rules/note";

export type NoteActionState = {
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

function emptyToUndefined(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function toNotedAt(date: string) {
  return new Date(`${date}T00:00:00.000`);
}

function toTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function toNoteData(values: NoteFormValues) {
  return {
    type: values.type,
    title: emptyToUndefined(values.title),
    content: values.content,
    notedAt: toNotedAt(values.date),
    photoUrl: emptyToUndefined(values.photoUrl),
    tags: toTags(values.tags),
  };
}

export async function createNoteAction(
  aquariumId: string,
  input: unknown
): Promise<NoteActionState> {
  const user = await requireUser();
  const parsedInput = noteFormSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      message: "Verifie les informations de la note.",
      fieldErrors: formatFieldErrors(parsedInput.error),
    };
  }

  const aquarium = await prisma.aquarium.findFirst({
    where: {
      id: aquariumId,
      userId: user.id,
      isArchived: false,
    },
    select: {
      id: true,
    },
  });

  if (!aquarium) {
    return {
      message: "Aquarium introuvable ou inaccessible.",
    };
  }

  await prisma.note.create({
    data: {
      userId: user.id,
      aquariumId: aquarium.id,
      ...toNoteData(parsedInput.data),
    },
  });

  redirect(`/aquariums/${aquarium.id}/notes`);
}

export async function updateNoteAction(
  noteId: string,
  input: unknown
): Promise<NoteActionState> {
  const user = await requireUser();
  const parsedInput = noteFormSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      message: "Verifie les informations de la note.",
      fieldErrors: formatFieldErrors(parsedInput.error),
    };
  }

  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      userId: user.id,
      aquarium: {
        userId: user.id,
        isArchived: false,
      },
    },
    select: {
      id: true,
      aquariumId: true,
    },
  });

  if (!note) {
    return {
      message: "Note introuvable ou inaccessible.",
    };
  }

  await prisma.note.update({
    where: {
      id: note.id,
    },
    data: toNoteData(parsedInput.data),
  });

  redirect(`/aquariums/${note.aquariumId}/notes`);
}

export async function deleteNoteAction(noteId: string) {
  const user = await requireUser();
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      userId: user.id,
      aquarium: {
        userId: user.id,
        isArchived: false,
      },
    },
    select: {
      id: true,
      aquariumId: true,
    },
  });

  if (!note) {
    redirect("/aquariums");
  }

  await prisma.note.delete({
    where: {
      id: note.id,
    },
  });

  redirect(`/aquariums/${note.aquariumId}/notes`);
}
