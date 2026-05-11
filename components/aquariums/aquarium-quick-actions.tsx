import Link from "next/link";
import { CircleCheck, FlaskConical, History, Leaf } from "lucide-react";

import { cn } from "@/lib/utils";

type AquariumQuickActionsProps = {
  aquariumId: string;
};

const actions = [
  {
    label: "Test",
    href: (id: string) => `/aquariums/${id}/water`,
    icon: FlaskConical,
    enabled: true,
  },
  {
    label: "Algues",
    href: () => "",
    icon: Leaf,
    enabled: false,
  },
  {
    label: "Action",
    href: (id: string) => `/aquariums/${id}/maintenance`,
    icon: CircleCheck,
    enabled: true,
  },
  {
    label: "Historique",
    href: (id: string) => `/aquariums/${id}/stats`,
    icon: History,
    enabled: true,
  },
];

export function AquariumQuickActions({ aquariumId }: AquariumQuickActionsProps) {
  return (
    <section className="aqua-fade-up aqua-delay-3 mx-auto mt-4 w-full max-w-[32rem]">
      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {actions.map((action) => {
          const content = (
            <>
              <span className="mx-auto flex size-12 items-center justify-center text-teal-300 drop-shadow-[0_0_18px_rgba(45,212,191,0.28)] sm:size-14">
                <action.icon className="size-9 stroke-[1.85] sm:size-10" aria-hidden="true" />
              </span>
              <span className="mt-3 block text-base font-medium text-teal-300 sm:text-lg">
                {action.label}
              </span>
            </>
          );
          const className = cn(
            "min-h-[7.35rem] rounded-[1.85rem] border border-white/10 bg-[#171918] px-2 py-4 text-center shadow-[0_18px_34px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.04)] transition sm:min-h-[8.5rem] sm:rounded-[2.1rem]",
            action.enabled
              ? "hover:-translate-y-0.5 hover:border-teal-300/28 hover:bg-[#1b1e1d] active:translate-y-0"
              : "cursor-not-allowed opacity-90"
          );

          if (!action.enabled) {
            return (
              <div
                key={action.label}
                className={className}
                aria-disabled="true"
                title="Module algues bientot disponible"
              >
                {content}
              </div>
            );
          }

          return (
            <Link
              key={action.label}
              href={action.href(aquariumId)}
              className={className}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
