"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  maintenanceFormSchema,
  maintenanceTypeOptions,
  type MaintenanceFormInput,
} from "@/rules/maintenance";
import {
  createMaintenanceLogAction,
  type MaintenanceActionState,
} from "@/services/maintenance-actions";

type MaintenanceFormProps = {
  aquariumId: string;
};

type FieldProps = {
  id: keyof MaintenanceFormInput;
  label: string;
  register: ReturnType<typeof useForm<MaintenanceFormInput>>["register"];
  error?: string;
  type?: string;
  step?: string;
};

function getTodayValue() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function Field({
  id,
  label,
  register,
  error,
  type = "number",
  step = "0.01",
}: FieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        step={type === "number" ? step : undefined}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
        {...register(id)}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export function MaintenanceForm({ aquariumId }: MaintenanceFormProps) {
  const today = useMemo(() => getTodayValue(), []);
  const [actionState, setActionState] = useState<MaintenanceActionState>({});
  const [isPending, startTransition] = useTransition();
  const form = useForm<MaintenanceFormInput>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      date: today,
      type: "WATER_CHANGE",
      waterChangeLiters: "",
      waterChangePercent: "",
      notes: "",
    },
  });

  function onSubmit(values: MaintenanceFormInput) {
    setActionState({});

    startTransition(() => {
      void createMaintenanceLogAction(aquariumId, values).then((result) => {
        if (!result) {
          return;
        }

        setActionState(result);

        Object.entries(result.fieldErrors ?? {}).forEach(([field, error]) => {
          form.setError(field as keyof MaintenanceFormInput, {
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
        Ajouter un entretien
      </h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field
          id="date"
          label="Date"
          type="date"
          register={form.register}
          error={errors.date?.message}
        />

        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium text-slate-700">
            Type
          </label>
          <select
            id="type"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
            {...form.register("type")}
          >
            {maintenanceTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.type?.message ? (
            <p className="text-sm text-red-600">{errors.type.message}</p>
          ) : null}
        </div>

        <Field
          id="waterChangeLiters"
          label="Volume change"
          register={form.register}
          error={errors.waterChangeLiters?.message}
        />
        <Field
          id="waterChangePercent"
          label="Pourcentage change"
          register={form.register}
          error={errors.waterChangePercent?.message}
        />
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
        <Button type="submit" className="h-10" disabled={isPending}>
          <Plus className="size-4" aria-hidden="true" />
          {isPending ? "Ajout..." : "Ajouter l'entretien"}
        </Button>
      </div>
    </form>
  );
}
