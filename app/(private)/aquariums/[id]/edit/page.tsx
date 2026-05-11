import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AquariumForm } from "@/components/aquariums/aquarium-form";
import { requireUser } from "@/lib/auth/session";
import { getAquariumFormDefaults } from "@/services/aquarium-service";

export const dynamic = "force-dynamic";

type EditAquariumPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditAquariumPage({ params }: EditAquariumPageProps) {
  const { id } = await params;
  const user = await requireUser();
  const aquarium = await getAquariumFormDefaults(user.id, id);

  if (!aquarium) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Link
        href={`/aquariums/${id}`}
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-cyan-700"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Retour au detail
      </Link>
      <section className="rounded-lg border border-cyan-100 bg-white p-6 shadow-sm shadow-cyan-950/5">
        <p className="text-sm font-medium text-cyan-700">Modification</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          Modifier {aquarium.name}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Mets a jour les informations techniques de ton bac.
        </p>
      </section>
      <AquariumForm mode="edit" aquariumId={id} defaultValues={aquarium} />
    </div>
  );
}
