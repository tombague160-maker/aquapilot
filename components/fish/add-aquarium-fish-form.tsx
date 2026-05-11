"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  addAquariumFishFormSchema,
  type AddAquariumFishFormInput,
} from "@/rules/fish";
import {
  addFishToAquariumAction,
  type FishActionState,
} from "@/services/fish-actions";
import type { FishSpeciesOption } from "@/services/fish-service";

type AddAquariumFishFormProps = {
  aquariumId: string;
  speciesOptions: FishSpeciesOption[];
};

function getTodayValue() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

export function AddAquariumFishForm({
  aquariumId,
  speciesOptions,
}: AddAquariumFishFormProps) {
  const today = useMemo(() => getTodayValue(), []);
  const [actionState, setActionState] = useState<FishActionState>({});
  const [isPending, startTransition] = useTransition();
  const form = useForm<AddAquariumFishFormInput>({
    resolver: zodResolver(addAquariumFishFormSchema),
    defaultValues: {
      speciesId: speciesOptions[0]?.id ?? "",
      quantity: "1",
      acquiredAt: today,
      notes: "",
    },
  });

  function onSubmit(values: AddAquariumFishFormInput) {
    setActionState({});

    startTransition(() => {
      void addFishToAquariumAction(aquariumId, values).then((result) => {
        if (!result) {
          return;
        }

        setActionState(result);

        Object.entries(result.fieldErrors ?? {}).forEach(([field, error]) => {
          form.setError(field as keyof AddAquariumFishFormInput, {
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
        Ajouter des poissons
      </h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2 xl:col-span-2">
          <label
            htmlFor="speciesId"
            className="text-sm font-medium text-slate-700"
          >
            Espece
          </label>
          <select
            id="speciesId"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
            {...form.register("speciesId")}
          >
            {speciesOptions.length > 0 ? (
              speciesOptions.map((species) => (
                <option key={species.id} value={species.id}>
                  {species.label}
                </option>
              ))
            ) : (
              <option value="">Aucune espece disponible</option>
            )}
          </select>
          {errors.speciesId?.message ? (
            <p className="text-sm text-red-600">{errors.speciesId.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="quantity"
            className="text-sm font-medium text-slate-700"
          >
            Quantite
          </label>
          <input
            id="quantity"
            type="number"
            min="1"
            step="1"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
            {...form.register("quantity")}
          />
          {errors.quantity?.message ? (
            <p className="text-sm text-red-600">{errors.quantity.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="acquiredAt"
            className="text-sm font-medium text-slate-700"
          >
            Date d&apos;ajout
          </label>
          <input
            id="acquiredAt"
            type="date"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
            {...form.register("acquiredAt")}
          />
          {errors.acquiredAt?.message ? (
            <p className="text-sm text-red-600">{errors.acquiredAt.message}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 space-y-2">
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

      {actionState.message ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {actionState.message}
        </p>
      ) : null}

      <div className="mt-5 flex justify-end">
        <Button
          type="submit"
          className="h-10"
          disabled={isPending || speciesOptions.length === 0}
        >
          <Plus className="size-4" aria-hidden="true" />
          {isPending ? "Ajout..." : "Ajouter a l'aquarium"}
        </Button>
      </div>
    </form>
  );
}
