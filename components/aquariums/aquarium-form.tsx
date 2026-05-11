"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  aquariumFormSchema,
  aquariumTypeOptions,
  type AquariumFormInput,
} from "@/rules/aquarium";
import {
  createAquariumAction,
  updateAquariumAction,
  type AquariumActionState,
} from "@/services/aquarium-actions";

const emptyDefaults: AquariumFormInput = {
  name: "",
  type: "FRESHWATER_COMMUNITY",
  volumeLiters: "",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
  startedAt: "",
  currentTemperatureC: "",
  targetTemperatureC: "",
  filtrationType: "",
  filterFlowLitersHour: "",
  heaterType: "",
  heaterPowerWatts: "",
  lightingType: "",
  lightingHoursPerDay: "",
  substrate: "",
  decorations: "",
  hasCo2: false,
  fertilizer: "",
  notes: "",
  imageUrl: "",
};

type AquariumFormProps = {
  mode: "create" | "edit";
  aquariumId?: string;
  defaultValues?: AquariumFormInput;
};

type TextFieldProps = {
  id: keyof AquariumFormInput;
  label: string;
  type?: string;
  placeholder?: string;
  register: ReturnType<typeof useForm<AquariumFormInput>>["register"];
  error?: string;
};

function TextField({
  id,
  label,
  type = "text",
  placeholder,
  register,
  error,
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

export function AquariumForm({
  mode,
  aquariumId,
  defaultValues,
}: AquariumFormProps) {
  const [actionState, setActionState] = useState<AquariumActionState>({});
  const [isPending, startTransition] = useTransition();
  const form = useForm<AquariumFormInput>({
    resolver: zodResolver(aquariumFormSchema),
    defaultValues: {
      ...emptyDefaults,
      ...defaultValues,
    },
  });

  function onSubmit(values: AquariumFormInput) {
    setActionState({});

    startTransition(() => {
      const action =
        mode === "create"
          ? createAquariumAction(values)
          : updateAquariumAction(aquariumId ?? "", values);

      void action.then((result) => {
        if (!result) {
          return;
        }

        setActionState(result);

        Object.entries(result.fieldErrors ?? {}).forEach(([field, error]) => {
          form.setError(field as keyof AquariumFormInput, {
            message: error,
          });
        });
      });
    });
  }

  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <section className="aqua-card p-5">
        <h2 className="text-lg font-semibold text-slate-950">
          Informations generales
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <TextField
            id="name"
            label="Nom"
            placeholder="Bac salon"
            register={form.register}
            error={errors.name?.message}
          />

          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium text-slate-700">
              Type d&apos;aquarium
            </label>
            <select
              id="type"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
              {...form.register("type")}
            >
              {aquariumTypeOptions.map((option) => (
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
            id="volumeLiters"
            label="Volume en litres"
            type="number"
            register={form.register}
            error={errors.volumeLiters?.message}
          />
          <TextField
            id="startedAt"
            label="Date de mise en eau"
            type="date"
            register={form.register}
            error={errors.startedAt?.message}
          />
          <TextField
            id="imageUrl"
            label="Image optionnelle"
            type="url"
            placeholder="https://..."
            register={form.register}
            error={errors.imageUrl?.message}
          />
        </div>
      </section>

      <section className="aqua-card p-5">
        <h2 className="text-lg font-semibold text-slate-950">Dimensions</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <TextField
            id="lengthCm"
            label="Longueur"
            type="number"
            register={form.register}
            error={errors.lengthCm?.message}
          />
          <TextField
            id="widthCm"
            label="Largeur"
            type="number"
            register={form.register}
            error={errors.widthCm?.message}
          />
          <TextField
            id="heightCm"
            label="Hauteur"
            type="number"
            register={form.register}
            error={errors.heightCm?.message}
          />
        </div>
      </section>

      <section className="aqua-card p-5">
        <h2 className="text-lg font-semibold text-slate-950">Technique</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <TextField
            id="currentTemperatureC"
            label="Temperature actuelle"
            type="number"
            register={form.register}
            error={errors.currentTemperatureC?.message}
          />
          <TextField
            id="targetTemperatureC"
            label="Temperature cible"
            type="number"
            register={form.register}
            error={errors.targetTemperatureC?.message}
          />
          <TextField
            id="filtrationType"
            label="Type de filtration"
            register={form.register}
            error={errors.filtrationType?.message}
          />
          <TextField
            id="filterFlowLitersHour"
            label="Debit du filtre"
            type="number"
            register={form.register}
            error={errors.filterFlowLitersHour?.message}
          />
          <TextField
            id="heaterType"
            label="Type de chauffage"
            register={form.register}
            error={errors.heaterType?.message}
          />
          <TextField
            id="heaterPowerWatts"
            label="Puissance chauffage"
            type="number"
            register={form.register}
            error={errors.heaterPowerWatts?.message}
          />
          <TextField
            id="lightingType"
            label="Type d'eclairage"
            register={form.register}
            error={errors.lightingType?.message}
          />
          <TextField
            id="lightingHoursPerDay"
            label="Duree d'eclairage par jour"
            type="number"
            register={form.register}
            error={errors.lightingHoursPerDay?.message}
          />
        </div>
      </section>

      <section className="aqua-card p-5">
        <h2 className="text-lg font-semibold text-slate-950">
          Sol et plantation
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <TextField
            id="substrate"
            label="Sol / sable / substrat"
            register={form.register}
            error={errors.substrate?.message}
          />
          <TextField
            id="fertilizer"
            label="Engrais utilise"
            register={form.register}
            error={errors.fertilizer?.message}
          />
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-3">
            <input
              id="hasCo2"
              type="checkbox"
              className="size-4 rounded border-slate-300 text-cyan-700 focus:ring-cyan-500"
              {...form.register("hasCo2")}
            />
            <label htmlFor="hasCo2" className="text-sm font-medium text-slate-700">
              Presence CO2
            </label>
          </div>
        </div>
      </section>

      <section className="aqua-card p-5">
        <h2 className="text-lg font-semibold text-slate-950">Notes</h2>
        <div className="mt-5 grid gap-4">
          <div className="space-y-2">
            <label
              htmlFor="decorations"
              className="text-sm font-medium text-slate-700"
            >
              Decors
            </label>
            <textarea
              id="decorations"
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
              {...form.register("decorations")}
            />
            {errors.decorations?.message ? (
              <p className="text-sm text-red-600">
                {errors.decorations.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium text-slate-700">
              Notes
            </label>
            <textarea
              id="notes"
              rows={5}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
              {...form.register("notes")}
            />
            {errors.notes?.message ? (
              <p className="text-sm text-red-600">{errors.notes.message}</p>
            ) : null}
          </div>
        </div>
      </section>

      {actionState.message ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {actionState.message}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/aquariums"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
        >
          Annuler
        </Link>
        <Button type="submit" className="h-10" disabled={isPending}>
          <Save className="size-4" aria-hidden="true" />
          {isPending
            ? "Enregistrement..."
            : mode === "create"
              ? "Creer l'aquarium"
              : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
