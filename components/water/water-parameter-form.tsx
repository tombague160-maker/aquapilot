"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  waterParameterFormSchema,
  type WaterParameterFormInput,
} from "@/rules/water-parameter";
import {
  createWaterParameterAction,
  type WaterParameterActionState,
} from "@/services/water-parameter-actions";

type WaterParameterFormProps = {
  aquariumId: string;
};

type FieldProps = {
  id: keyof WaterParameterFormInput;
  label: string;
  register: ReturnType<typeof useForm<WaterParameterFormInput>>["register"];
  error?: string;
  type?: string;
  step?: string;
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

export function WaterParameterForm({ aquariumId }: WaterParameterFormProps) {
  const dateTimeDefaults = useMemo(() => getLocalDateTimeDefaults(), []);
  const [actionState, setActionState] = useState<WaterParameterActionState>({});
  const [isPending, startTransition] = useTransition();
  const form = useForm<WaterParameterFormInput>({
    resolver: zodResolver(waterParameterFormSchema),
    defaultValues: {
      ...dateTimeDefaults,
      temperatureC: "",
      ph: "",
      kh: "",
      gh: "",
      nitriteMgL: "",
      nitrateMgL: "",
      ammoniaMgL: "",
      phosphateMgL: "",
      ironMgL: "",
      tdsPpm: "",
      co2MgL: "",
      oxygenMgL: "",
      chlorineMgL: "",
      notes: "",
    },
  });

  function onSubmit(values: WaterParameterFormInput) {
    setActionState({});

    startTransition(() => {
      void createWaterParameterAction(aquariumId, values).then((result) => {
        if (!result) {
          return;
        }

        setActionState(result);

        Object.entries(result.fieldErrors ?? {}).forEach(([field, error]) => {
          form.setError(field as keyof WaterParameterFormInput, {
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
        Ajouter une mesure
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
        <Field
          id="temperatureC"
          label="Temperature"
          step="0.1"
          register={form.register}
          error={errors.temperatureC?.message}
        />
        <Field
          id="ph"
          label="pH"
          step="0.1"
          register={form.register}
          error={errors.ph?.message}
        />
        <Field
          id="kh"
          label="KH"
          step="1"
          register={form.register}
          error={errors.kh?.message}
        />
        <Field
          id="gh"
          label="GH"
          step="1"
          register={form.register}
          error={errors.gh?.message}
        />
        <Field
          id="nitriteMgL"
          label="NO2"
          step="0.001"
          register={form.register}
          error={errors.nitriteMgL?.message}
        />
        <Field
          id="nitrateMgL"
          label="NO3"
          register={form.register}
          error={errors.nitrateMgL?.message}
        />
        <Field
          id="ammoniaMgL"
          label="NH3/NH4"
          step="0.001"
          register={form.register}
          error={errors.ammoniaMgL?.message}
        />
        <Field
          id="phosphateMgL"
          label="PO4"
          register={form.register}
          error={errors.phosphateMgL?.message}
        />
        <Field
          id="ironMgL"
          label="Fer"
          step="0.001"
          register={form.register}
          error={errors.ironMgL?.message}
        />
        <Field
          id="tdsPpm"
          label="TDS"
          step="1"
          register={form.register}
          error={errors.tdsPpm?.message}
        />
        <Field
          id="co2MgL"
          label="CO2"
          register={form.register}
          error={errors.co2MgL?.message}
        />
        <Field
          id="oxygenMgL"
          label="Oxygene"
          register={form.register}
          error={errors.oxygenMgL?.message}
        />
        <Field
          id="chlorineMgL"
          label="Chlore"
          step="0.001"
          register={form.register}
          error={errors.chlorineMgL?.message}
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
          {isPending ? "Ajout..." : "Ajouter la mesure"}
        </Button>
      </div>
    </form>
  );
}
