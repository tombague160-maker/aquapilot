"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteAquariumAction } from "@/services/aquarium-actions";

type DeleteAquariumButtonProps = {
  aquariumId: string;
  aquariumName: string;
};

export function DeleteAquariumButton({
  aquariumId,
  aquariumName,
}: DeleteAquariumButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  function onDelete() {
    startTransition(() => {
      void deleteAquariumAction(aquariumId);
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        className="h-10"
        onClick={() => setIsOpen(true)}
        disabled={isPending}
      >
        <Trash2 className="size-4" aria-hidden="true" />
        {isPending ? "Suppression..." : "Supprimer"}
      </Button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-red-400/25 bg-slate-950 p-5 shadow-2xl shadow-black/45">
            <div className="flex items-start gap-3">
              <span className="rounded-lg border border-red-400/25 bg-red-500/12 p-2 text-red-300">
                <AlertTriangle className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Supprimer cet aquarium ?
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {aquariumName} sera supprime avec ses mesures, rappels,
                  alertes, notes et historiques rattaches.
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
              >
                <X className="size-4" aria-hidden="true" />
                Annuler
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                disabled={isPending}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
