"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { markNotificationReadAction } from "@/services/notification-actions";

type NotificationReadButtonProps = {
  notificationId: string;
};

export function NotificationReadButton({
  notificationId,
}: NotificationReadButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      className="h-9"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          void markNotificationReadAction(notificationId);
        });
      }}
    >
      <Check className="size-4" aria-hidden="true" />
      {isPending ? "Lecture..." : "Marquer lue"}
    </Button>
  );
}
