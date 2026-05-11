import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth/session";
import { getNotificationBellSummary } from "@/services/notification-service";

export const dynamic = "force-dynamic";

type PrivateLayoutProps = {
  children: ReactNode;
};

export default async function PrivateLayout({ children }: PrivateLayoutProps) {
  const user = await requireUser();
  const notificationSummary = await getNotificationBellSummary(user.id);

  return (
    <AppShell user={user} notificationSummary={notificationSummary}>
      {children}
    </AppShell>
  );
}
