import type { ReactNode } from "react";

import { DesktopSidebar } from "@/components/desktop-sidebar";
import { MobileNavigation } from "@/components/mobile-navigation";
import { NotificationBell } from "@/components/notifications/notification-bell";
import type { CurrentUser } from "@/lib/auth/session";
import type { NotificationBellSummary } from "@/services/notification-service";

type AppShellProps = {
  children: ReactNode;
  user: CurrentUser;
  notificationSummary: NotificationBellSummary;
};

export function AppShell({
  children,
  user,
  notificationSummary,
}: AppShellProps) {
  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <DesktopSidebar user={user} />
      <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_50%_-14%,rgba(37,99,235,0.12),transparent_32rem),linear-gradient(180deg,#020617,#030712)] md:pl-72">
        <header className="sticky top-0 z-20 hidden border-b border-blue-500/20 bg-slate-950/78 px-4 py-3 shadow-sm shadow-black/30 backdrop-blur-xl sm:px-6 md:block lg:px-8">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
            <div>
              <p className="text-xs font-medium text-sky-300">AquaPilot</p>
              <p className="text-base font-semibold text-slate-50">
                {user.name ?? user.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell summary={notificationSummary} />
              <div className="flex size-10 items-center justify-center rounded-lg border border-blue-400/25 bg-blue-500/12 text-sm font-semibold text-sky-200 shadow-sm shadow-blue-950/30">
                {initials}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 md:py-8 md:pb-8">
          {children}
        </main>
        <MobileNavigation />
      </div>
    </div>
  );
}
