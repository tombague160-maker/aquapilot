import Link from "next/link";
import {
  Bell,
  CheckCheck,
  ChevronRight,
  CircleDot,
  Inbox,
} from "lucide-react";

import { NotificationReadButton } from "@/components/notifications/notification-read-button";
import { requireUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { markAllNotificationsReadAction } from "@/services/notification-actions";
import {
  getUserNotifications,
  type NotificationEntry,
} from "@/services/notification-service";

export const dynamic = "force-dynamic";

const notificationToneByType: Record<string, string> = {
  ALERT: "border-red-200 bg-red-50 text-red-700",
  REMINDER: "border-amber-200 bg-amber-50 text-amber-800",
  AI_RECOMMENDATION: "border-violet-200 bg-violet-50 text-violet-800",
  WATER_TEST: "border-cyan-200 bg-cyan-50 text-cyan-800",
  WATER_CHANGE: "border-sky-200 bg-sky-50 text-sky-800",
  MAINTENANCE: "border-slate-200 bg-slate-50 text-slate-700",
  SYSTEM: "border-slate-200 bg-slate-50 text-slate-700",
};

function NotificationCard({
  notification,
}: {
  notification: NotificationEntry;
}) {
  const tone =
    notificationToneByType[notification.type] ?? notificationToneByType.SYSTEM;

  return (
    <article
      className={cn(
        "rounded-lg border bg-white p-5 shadow-sm shadow-slate-950/5",
        notification.isUnread ? "border-cyan-200" : "border-slate-200"
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium",
                tone
              )}
            >
              {notification.isUnread ? (
                <CircleDot className="size-3" aria-hidden="true" />
              ) : null}
              {notification.typeLabel}
            </span>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
              {notification.createdAtLabel}
            </span>
            {notification.aquariumName ? (
              <span className="rounded-lg bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-800">
                {notification.aquariumName}
              </span>
            ) : null}
          </div>

          <h2 className="mt-3 text-lg font-semibold text-slate-950">
            {notification.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {notification.message}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={notification.actionUrl}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-cyan-700 px-3 text-sm font-medium text-white transition-colors hover:bg-cyan-800"
          >
            Ouvrir
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
          {notification.isUnread ? (
            <NotificationReadButton notificationId={notification.id} />
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await getUserNotifications(user.id);
  const unreadCount = notifications.filter(
    (notification) => notification.isUnread
  ).length;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-lg border border-cyan-100 bg-white p-6 shadow-sm shadow-cyan-950/5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-cyan-700">AquaPilot</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">
            Notifications
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Suis les rappels, alertes critiques, recommandations d&apos;eau et
            conseils IA internes.
          </p>
        </div>
        <form action={markAllNotificationsReadAction}>
          <button
            type="submit"
            className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
            disabled={unreadCount === 0}
          >
            <CheckCheck className="size-4" aria-hidden="true" />
            Tout marquer comme lu
          </button>
        </form>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="aqua-card p-5">
          <p className="text-sm font-medium text-slate-500">Non lues</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {unreadCount}
          </p>
        </article>
        <article className="aqua-card p-5">
          <p className="text-sm font-medium text-slate-500">Total</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {notifications.length}
          </p>
        </article>
        <article className="aqua-card p-5">
          <p className="text-sm font-medium text-slate-500">Generation</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            Auto
          </p>
        </article>
      </section>

      <section className="aqua-surface p-6">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
            <Bell className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Liste</h2>
            <p className="mt-1 text-sm text-slate-500">
              Les notifications non lues sont affichees en premier.
            </p>
          </div>
        </div>

        {notifications.length > 0 ? (
          <div className="mt-5 grid gap-4">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-cyan-200 bg-cyan-50/40 p-6 text-center">
            <Inbox className="size-10 text-cyan-700" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-semibold text-slate-950">
              Aucune notification
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
              Les rappels, alertes et conseils internes apparaitront ici.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
