import Link from "next/link";
import { CalendarDays, Droplet, Home, Plus, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type MobileBottomNavigationProps = {
  aquariumId: string;
};

export function MobileBottomNavigation({
  aquariumId,
}: MobileBottomNavigationProps) {
  const items = [
    {
      label: "Accueil",
      href: `/aquariums/${aquariumId}`,
      icon: Home,
      active: true,
    },
    {
      label: "Bacs",
      href: "/aquariums",
      icon: Droplet,
      active: false,
    },
    {
      label: "Planning",
      href: `/aquariums/${aquariumId}/reminders`,
      icon: CalendarDays,
      active: false,
    },
    {
      label: "Assistant",
      href: `/aquariums/${aquariumId}/assistant`,
      icon: Sparkles,
      active: false,
    },
    {
      label: "Actions",
      href: `/aquariums/${aquariumId}/maintenance`,
      icon: Plus,
      active: false,
    },
  ];

  return (
    <nav
      className="aqua-fade-up aqua-delay-4 fixed inset-x-0 bottom-3 z-50 mx-auto w-[calc(100%-1.5rem)] max-w-[34rem] rounded-[2.25rem] border border-cyan-200/16 bg-[#17273a]/68 px-2.5 py-2.5 shadow-[0_24px_72px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.11)] backdrop-blur-2xl md:hidden"
      style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      aria-label="Navigation principale mobile"
    >
      <div className="grid grid-cols-5 gap-1 rounded-[1.8rem] border border-cyan-100/10 bg-slate-950/34 p-1">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-[1.45rem] px-1 py-2.5 text-[0.69rem] font-semibold transition sm:text-xs",
              item.active
                ? "bg-[radial-gradient(circle_at_35%_18%,rgba(74,222,203,0.38),rgba(125,211,252,0.16)_45%,rgba(255,255,255,0.08)_100%)] text-teal-200 shadow-[0_14px_30px_rgba(125,211,252,0.18),inset_0_1px_0_rgba(255,255,255,0.16)]"
                : "text-slate-100/82 hover:bg-blue-500/10 hover:text-white"
            )}
          >
            <item.icon
              className={cn(
                "size-7 drop-shadow-[0_0_14px_rgba(125,211,252,0.2)]",
                item.active ? "text-teal-300" : "text-slate-100/82"
              )}
              aria-hidden="true"
            />
            <span className="max-w-full whitespace-nowrap">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
