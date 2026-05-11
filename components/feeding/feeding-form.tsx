"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  feedingFoodTypeOptions,
  feedingFormSchema,
  type FeedingFormInput,
} from "@/rules/feeding";
import {
  createFeedingLogAction,
  type FeedingActionState,
} from "@/services/feeding-actions";

type FeedingFormProps = {
  aquariumId: string;
};

type FieldProps = {
  id: keyof FeedingFormInput;
  label: string;
  register: ReturnType<typeof useForm<FeedingFormInput>>["register"];
  error?: string;
  type?: string;
};

function getLocalDateTimeDefaults() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  const localDate = new Date(now.getTime() - timezoneOffset);

  return {
    date: localDate.toISOString().slice(0, 10),
    time: localDate.toISOString().slice(11, 16),
  };
}

function Field({ id, label, register, error, type = "text" }: FieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
        {...register(id)}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export function FeedingForm({ aquariumId }: FeedingFormProps) {
  const dateTimeDefaults = useMemo(() => getLocalDateTimeDefaults(), []);
  const [actionState, setActionState] = useState<FeedingActionState>({});
  const [isPending, startTransition] = useTransition();
  const form = useForm<FeedingFormInput>({
    resolver: zodResolver(feedingFormSchema),
    defaultValues: {
      ...dateTimeDefaults,
      foodType: "FLAKES",
      amount: "",
      species: "",
      notes: "",
      observationAfter: "",
    },
  });

  function onSubmit(values: FeedingFormInput) {
    setActionState({});

    startTransition(() => {
      void createFeedingLogAction(aquariumId, values).then((result) => {
        if (!result) {
          return;
        }

        setActionState(result);

        Object.entries(result.fieldErrors ?? {}).forEach(([field, error]) => {
          form.setError(field as keyof FeedingFormInput, {
            message: error,
          });
        });
      });
    });
  }

  const errors = form.formState.errors;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="aqua-card p-5"
    >
      <h2 className="text-lg font-semibold text-slate-950">
        Ajouter un nourrissage
      </h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field
          id="date"
          label="Date"
          type="date"
          register={form.register}
          error={errors.date?.message}
        />
        <Field
          id="time"
          label="Heure"
          type="time"
          register={form.register}
          error={errors.time?.message}
        />

        <div className="space-y-2">
          <label
            htmlFor="foodType"
            className="text-sm font-medium text-slate-700"
          >
            Type de nourriture
          </label>
          <select
            id="foodType"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
            {...form.register("foodType")}
          >
            {feedingFoodTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.foodType?.message ? (
            <p className="text-sm text-red-600">{errors.foodType.message}</p>
          ) : null}
        </div>

        <Field
          id="amount"
          label="Quantite"
          register={form.register}
          error={errors.amount?.message}
        />
        <Field
          id="species"
          label="Especes concernees"
          register={form.register}
          error={errors.species?.message}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="notes" className="text-sm font-medium text-slate-700">
            Notes
          </label>
          <textarea
            id="notes"
            rows={4}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
            {...form.register("notes")}
          />
          {errors.notes?.message ? (
            <p className="text-sm text-red-600">{errors.notes.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="observationAfter"
            className="text-sm font-medium text-slate-700"
          >
            Observation apres nourrissage
          </label>
          <textarea
            id="observationAfter"
            rows={4}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
            {...form.register("observationAfter")}
          />
          {errors.observationAfter?.message ? (
            <p className="text-sm text-red-600">
              {errors.observationAfter.message}
            </p>
          ) : null}
        </div>
      </div>

      {actionState.message ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {actionState.message}
        </p>
      ) : null}

      <div className="mt-5 flex justify-end">
        <Button type="submit" className="h-10" disabled={isPending}>
          <Plus className="size-4" aria-hidden="true" />
          {isPending ? "Ajout..." : "Ajouter le nourrissage"}
        </Button>
      </div>
    </form>
  );
}
