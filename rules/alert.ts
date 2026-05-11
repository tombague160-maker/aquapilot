export const alertSeverityOptions = [
  { value: "INFORMATION", label: "Information" },
  { value: "ATTENTION", label: "Attention" },
  { value: "IMPORTANT", label: "Important" },
  { value: "CRITICAL", label: "Critique" },
] as const;

export type AlertSeverityValue = (typeof alertSeverityOptions)[number]["value"];
export type AlertPriorityValue = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export function getAlertSeverityLabel(severity: string) {
  return (
    alertSeverityOptions.find((option) => option.value === severity)?.label ??
    "Attention"
  );
}

export function alertSeverityToPriority(
  severity: AlertSeverityValue
): AlertPriorityValue {
  switch (severity) {
    case "INFORMATION":
      return "LOW";
    case "ATTENTION":
      return "MEDIUM";
    case "IMPORTANT":
      return "HIGH";
    case "CRITICAL":
      return "CRITICAL";
  }
}
