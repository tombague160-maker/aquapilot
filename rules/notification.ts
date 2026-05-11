export const notificationTypeOptions = [
  { value: "ALERT", label: "Alerte" },
  { value: "REMINDER", label: "Rappel" },
  { value: "SYSTEM", label: "Systeme" },
  { value: "AI_RECOMMENDATION", label: "Conseil IA" },
  { value: "MAINTENANCE", label: "Entretien" },
  { value: "WATER_TEST", label: "Test d'eau" },
  { value: "WATER_CHANGE", label: "Changement d'eau" },
] as const;

export function getNotificationTypeLabel(type: string) {
  return (
    notificationTypeOptions.find((option) => option.value === type)?.label ??
    "Notification"
  );
}
