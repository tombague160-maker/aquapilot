"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Bot,
  BookOpen,
  Database,
  Fish,
  LayoutDashboard,
  Leaf,
  LogOut,
  Settings,
  Sparkles,
  Waves,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/lib/auth/session";
import { logoutAction } from "@/services/auth-actions";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    active: true,
  },
  {
    label: "Aquariums",
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
    label: "Donnees",
    href: "/dashboard#data",
    icon: Database,
    active: false,
  },
  {
    label: "Alertes",
    href: "/notifications",
    icon: Bell,
    active: false,
  },
  {
    label: "Assistant",
    href: "/dashboard#ai",
    icon: Bot,
    active: false,
  },
  {
    label: "Parametres",
    href: "/settings",
    icon: Settings,
    active: false,
  },
];

type DesktopSidebarProps = {
  user: CurrentUser;
};

export function DesktopSidebar({ user }: DesktopSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-blue-500/20 bg-slate-950/88 px-4 py-5 shadow-[14px_0_44px_rgba(0,0,0,0.42)] backdrop-blur-xl md:flex md:flex-col">
      <Link href="/dashboard" className="flex items-center gap-3 px-2">
        <span className="flex size-11 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/24">
          <Waves className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-lg font-semibold text-slate-50">AquaPilot</p>
          <p className="text-sm text-slate-400">Pilotage eau douce</p>
        </div>
      </Link>

      <div className="mt-6 rounded-lg border border-blue-400/20 bg-blue-500/10 p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-sky-100">
          <Sparkles className="size-4 text-sky-300" aria-hidden="true" />
          Suivi intelligent
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Alertes, rappels, stats et assistant contextualise.
        </p>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1" aria-label="Navigation">
        {navigationItems.map((item) => {
          const basePath = item.href.split("#")[0];
          const isActive =
            basePath === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(basePath);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/24"
                  : "text-slate-400 hover:bg-blue-500/10 hover:text-slate-50"
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-400/18 text-white shadow-inner shadow-sky-950/20"
                    : "bg-slate-900 text-sky-300 group-hover:bg-slate-800"
                )}
              >
                <item.icon className="size-4" aria-hidden="true" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 rounded-lg border border-blue-400/20 bg-slate-900/72 p-4 shadow-sm shadow-black/30">
        <div>
          <p className="text-sm font-medium text-slate-100">
            {user.name ?? "Compte AquaPilot"}
          </p>
          <p className="mt-1 break-all text-sm leading-6 text-slate-400">
            {user.email}
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-400/20 bg-slate-950 px-3 py-2 text-sm font-medium text-sky-100 shadow-sm transition-colors hover:bg-blue-500/12"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Se deconnecter
          </button>
        </form>
      </div>
    </aside>
  );
}
