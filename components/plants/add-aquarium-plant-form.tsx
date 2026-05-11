"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  addAquariumPlantFormSchema,
  plantStatusOptions,
  type AddAquariumPlantFormInput,
} from "@/rules/plant";
import {
  addPlantToAquariumAction,
  type PlantActionState,
} from "@/services/plant-actions";
import type { PlantSpeciesOption } from "@/services/plant-service";

type AddAquariumPlantFormProps = {
  aquariumId: string;
  speciesOptions: PlantSpeciesOption[];
};

function getTodayValue() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

export function AddAquariumPlantForm({
  aquariumId,
  speciesOptions,
}: AddAquariumPlantFormProps) {
  const today = useMemo(() => getTodayValue(), []);
  const [actionState, setActionState] = useState<PlantActionState>({});
  const [isPending, startTransition] = useTransition();
  const form = useForm<AddAquariumPlantFormInput>({
    resolver: zodResolver(addAquariumPlantFormSchema),
    defaultValues: {
      speciesId: speciesOptions[0]?.id ?? "",
      quantity: "1",
      plantedAt: today,
      status: "ACTIVE",
      placement: "",
      notes: "",
    },
  });

  function onSubmit(values: AddAquariumPlantFormInput) {
    setActionState({});

    startTransition(() => {
      void addPlantToAquariumAction(aquariumId, values).then((result) => {
        if (!result) {
          return;
        }

        setActionState(result);

        Object.entries(result.fieldErrors ?? {}).forEach(([field, error]) => {
          form.setError(field as keyof AddAquariumPlantFormInput, {
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
        Ajouter des plantes
      </h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
              <option value="">Aucune plante disponible</option>
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
            htmlFor="plantedAt"
            className="text-sm font-medium text-slate-700"
          >
            Date d&apos;ajout
          </label>
          <input
            id="plantedAt"
            type="date"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
            {...form.register("plantedAt")}
          />
          {errors.plantedAt?.message ? (
            <p className="text-sm text-red-600">{errors.plantedAt.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium text-slate-700">
            Etat de sante
          </label>
          <select
            id="status"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
            {...form.register("status")}
          >
            {plantStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.status?.message ? (
            <p className="text-sm text-red-600">{errors.status.message}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <label
          htmlFor="placement"
          className="text-sm font-medium text-slate-700"
        >
          Position dans l&apos;aquarium
        </label>
        <input
          id="placement"
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
          {...form.register("placement")}
        />
        {errors.placement?.message ? (
          <p className="text-sm text-red-600">{errors.placement.message}</p>
        ) : null}
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
