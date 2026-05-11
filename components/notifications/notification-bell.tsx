import Link from "next/link";
import { Bell } from "lucide-react";

import type { NotificationBellSummary } from "@/services/notification-service";

type NotificationBellProps = {
  summary: NotificationBellSummary;
};

export function NotificationBell({ summary }: NotificationBellProps) {
  const unreadLabel =
    summary.unreadCount > 99 ? "99+" : summary.unreadCount.toString();

  return (
    <Link
      href="/notifications"
      className="relative inline-flex size-10 items-center justify-center rounded-lg border border-blue-400/25 bg-slate-950/80 text-sky-200 shadow-sm shadow-blue-950/30 transition-all hover:-translate-y-0.5 hover:border-sky-400/45 hover:bg-blue-500/10 hover:text-sky-100 hover:shadow-md hover:shadow-sky-950/30"
      aria-label={
        summary.unreadCount > 0
          ? `${summary.unreadCount} notification(s) non lue(s)`
          : "Notifications"
      }
      title={summary.latestUnreadTitle ?? "Notifications"}
    >
      <Bell className="size-5" aria-hidden="true" />
      {summary.unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full border border-slate-950 bg-red-500 px-1.5 py-0.5 text-[0.68rem] font-semibold leading-none text-white shadow-sm shadow-red-950/40">
          {unreadLabel}
        </span>
      ) : null}
    </Link>
  );
}
