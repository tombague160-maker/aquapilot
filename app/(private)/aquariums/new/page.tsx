import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AquariumForm } from "@/components/aquariums/aquarium-form";

export const dynamic = "force-dynamic";

export default function NewAquariumPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Link
        href="/aquariums"
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-cyan-700"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Retour aux aquariums
      </Link>
      <section className="rounded-lg border border-cyan-100 bg-white p-6 shadow-sm shadow-cyan-950/5">
        <p className="text-sm font-medium text-cyan-700">Creation</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          Nouvel aquarium
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Renseigne les bases techniques du bac. Les modules vivants, mesures et
          maintenance viendront ensuite.
        </p>
      </section>
      <AquariumForm mode="create" />
    </div>
  );
}
