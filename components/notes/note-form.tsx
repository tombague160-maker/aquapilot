"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  noteFormSchema,
  noteTypeOptions,
  type NoteFormInput,
  type NoteTypeValue,
} from "@/rules/note";
import {
  createNoteAction,
  updateNoteAction,
  type NoteActionState,
} from "@/services/note-actions";
import type { NoteEntry } from "@/services/note-service";

type NoteFormProps = {
  aquariumId: string;
  note?: NoteEntry;
};

type TextFieldProps = {
  id: keyof NoteFormInput;
  label: string;
  register: ReturnType<typeof useForm<NoteFormInput>>["register"];
  error?: string;
  type?: string;
  placeholder?: string;
};

function getTodayValue() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function TextField({
  id,
  label,
  register,
  error,
  type = "text",
  placeholder,
}: TextFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
        {...register(id)}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export function NoteForm({ aquariumId, note }: NoteFormProps) {
  const today = useMemo(() => getTodayValue(), []);
  const [actionState, setActionState] = useState<NoteActionState>({});
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(note);
  const form = useForm<NoteFormInput>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: note?.title ?? "",
      content: note?.content ?? "",
      type: (note?.type as NoteTypeValue | undefined) ?? "OBSERVATION",
      date: note?.notedAtValue ?? today,
      photoUrl: note?.photoUrl ?? "",
      tags: note?.tags.join(", ") ?? "",
    },
  });
  const errors = form.formState.errors;

  function onSubmit(values: NoteFormInput) {
    setActionState({});

    startTransition(() => {
      const action = note
        ? updateNoteAction(note.id, values)
        : createNoteAction(aquariumId, values);

      void action.then((result) => {
        if (!result) {
          return;
        }

        setActionState(result);

        Object.entries(result.fieldErrors ?? {}).forEach(([field, error]) => {
          form.setError(field as keyof NoteFormInput, {
            message: error,
          });
        });
      });
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="aqua-card p-5"
    >
      <h2 className="text-lg font-semibold text-slate-950">
        {isEditing ? "Modifier la note" : "Ajouter une note"}
      </h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TextField
          id="title"
          label="Titre optionnel"
          register={form.register}
          error={errors.title?.message}
          placeholder="Observation du jour"
        />

        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium text-slate-700">
            Type de note
          </label>
          <select
            id="type"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
            {...form.register("type")}
          >
            {noteTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.type?.message ? (
            <p className="text-sm text-red-600">{errors.type.message}</p>
          ) : null}
        </div>

        <TextField
          id="date"
          label="Date"
          type="date"
          register={form.register}
          error={errors.date?.message}
        />

        <TextField
          id="photoUrl"
          label="Photo optionnelle"
          register={form.register}
          error={errors.photoUrl?.message}
          placeholder="https://..."
        />
      </div>

      <div className="mt-4 space-y-2">
        <label htmlFor="content" className="text-sm font-medium text-slate-700">
          Contenu
        </label>
        <textarea
          id="content"
          rows={5}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
          {...form.register("content")}
        />
        {errors.content?.message ? (
          <p className="text-sm text-red-600">{errors.content.message}</p>
        ) : null}
      </div>

      <div className="mt-4">
        <TextField
          id="tags"
          label="Tags optionnels"
          register={form.register}
          error={errors.tags?.message}
          placeholder="algues, comportement, croissance"
        />
      </div>

      {actionState.message ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {actionState.message}
        </p>
      ) : null}

      <div className="mt-5 flex justify-end">
        <Button type="submit" className="h-10" disabled={isPending}>
          <Save className="size-4" aria-hidden="true" />
          {isPending
            ? "Enregistrement..."
            : isEditing
              ? "Enregistrer"
              : "Ajouter la note"}
        </Button>
      </div>
    </form>
  );
}
