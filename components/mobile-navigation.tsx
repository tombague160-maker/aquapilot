"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpen, Fish, LayoutDashboard, Leaf, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

const mobileItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    active: true,
  },
  {
    label: "Bacs",
    href: "/aquariums",
    icon: Fish,
    active: false,
  },
  {
    label: "Especes",
    href: "/species/fish",
    icon: BookOpen,
    active: false,
  },
  {
    label: "Plantes",
    href: "/species/plants",
    icon: Leaf,
    active: false,
  },
  {
    label: "Alertes",
    href: "/notifications",
    icon: Bell,
    active: false,
  },
  {
    label: "Compte",
    href: "/settings",
    icon: Settings,
    active: false,
  },
];

export function MobileNavigation() {
  const pathname = usePathname();
  const isAquariumDetailPage = /^\/aquariums\/[^/]+$/.test(pathname);

  if (isAquariumDetailPage) {
    return null;
  }

  return (
    <nav
      className="fixed inset-x-2 bottom-2 z-30 rounded-[1.7rem] border border-cyan-100/14 bg-slate-950/78 px-2 py-2 shadow-[0_-18px_48px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl md:hidden"
      aria-label="Navigation mobile"
    >
      <div className="grid grid-cols-6 gap-1 rounded-[1.35rem] bg-blue-950/24 p-1">
        {mobileItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 text-xs font-medium transition-all",
                isActive
                  ? "bg-cyan-300/18 text-cyan-100 shadow-[0_10px_26px_rgba(34,211,238,0.16),inset_0_1px_0_rgba(255,255,255,0.1)]"
                  : "text-slate-300 hover:bg-blue-500/10 hover:text-white"
              )}
            >
              <item.icon className="size-4" aria-hidden="true" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
