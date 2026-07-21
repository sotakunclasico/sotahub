const compact = new Intl.NumberFormat("es-ES", { notation: "compact", maximumFractionDigits: 1 });
const date = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" });

export function formatCompact(value: number): string {
  return compact.format(value);
}

export function formatYouTubeDate(value: string): string {
  return date.format(new Date(value));
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return [hours, minutes, rest]
    .filter((_, index) => index > 0 || hours > 0)
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}
