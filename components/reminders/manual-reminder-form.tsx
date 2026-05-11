"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  manualReminderFormSchema,
  reminderPriorityOptions,
  reminderTypeOptions,
  type ManualReminderFormInput,
} from "@/rules/reminder";
import {
  createManualReminderAction,
  type ReminderActionState,
} from "@/services/reminder-actions";

type ManualReminderFormProps = {
  aquariumId: string;
};

function getTodayValue() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

export function ManualReminderForm({ aquariumId }: ManualReminderFormProps) {
  const today = useMemo(() => getTodayValue(), []);
  const [actionState, setActionState] = useState<ReminderActionState>({});
  const [isPending, startTransition] = useTransition();
  const form = useForm<ManualReminderFormInput>({
    resolver: zodResolver(manualReminderFormSchema),
    defaultValues: {
      type: "CUSTOM",
      title: "",
      description: "",
      dueDate: today,
      priority: "MEDIUM",
      repeatEveryDays: "",
    },
  });

  function onSubmit(values: ManualReminderFormInput) {
    setActionState({});

    startTransition(() => {
      void createManualReminderAction(aquariumId, values).then((result) => {
        if (!result) {
          return;
        }

        setActionState(result);

        if (!result.fieldErrors) {
          form.reset({
            type: "CUSTOM",
            title: "",
            description: "",
            dueDate: today,
            priority: "MEDIUM",
            repeatEveryDays: "",
          });
        }

        Object.entries(result.fieldErrors ?? {}).forEach(([field, error]) => {
          form.setError(field as keyof ManualReminderFormInput, {
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
        Creer un rappel manuel
      </h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium text-slate-700">
            Type
          </label>
          <select
            id="type"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
            {...form.register("type")}
          >
            {reminderTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.type?.message ? (
            <p className="text-sm text-red-600">{errors.type.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 xl:col-span-2">
          <label htmlFor="title" className="text-sm font-medium text-slate-700">
            Titre
          </label>
          <input
            id="title"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
            {...form.register("title")}
          />
          {errors.title?.message ? (
            <p className="text-sm text-red-600">{errors.title.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="dueDate"
            className="text-sm font-medium text-slate-700"
          >
            Date
          </label>
          <input
            id="dueDate"
            type="date"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
            {...form.register("dueDate")}
          />
          {errors.dueDate?.message ? (
            <p className="text-sm text-red-600">{errors.dueDate.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="priority"
            className="text-sm font-medium text-slate-700"
          >
            Priorite
          </label>
          <select
            id="priority"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
            {...form.register("priority")}
          >
            {reminderPriorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.priority?.message ? (
            <p className="text-sm text-red-600">{errors.priority.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="repeatEveryDays"
            className="text-sm font-medium text-slate-700"
          >
            Frequence jours
          </label>
          <input
            id="repeatEveryDays"
            type="number"
            min="1"
            step="1"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
            {...form.register("repeatEveryDays")}
          />
          {errors.repeatEveryDays?.message ? (
            <p className="text-sm text-red-600">
              {errors.repeatEveryDays.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label
            htmlFor="description"
            className="text-sm font-medium text-slate-700"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
            {...form.register("description")}
          />
          {errors.description?.message ? (
            <p className="text-sm text-red-600">
              {errors.description.message}
            </p>
          ) : null}
        </div>
      </div>

      {actionState.message ? (
        <p className="mt-4 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm text-cyan-800">
          {actionState.message}
        </p>
      ) : null}

      <div className="mt-5 flex justify-end">
        <Button type="submit" className="h-10" disabled={isPending}>
          <Plus className="size-4" aria-hidden="true" />
          {isPending ? "Creation..." : "Creer le rappel"}
        </Button>
      </div>
    </form>
  );
}
