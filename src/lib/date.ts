/**
 * Date Formatting Utility for "Our Little Universe"
 * Formats taken_at (custom date) falling back to created_at in Indonesian locale.
 */

export function getMemoryDateString(moment: {
  taken_at?: string | null;
  created_at: string;
}): string {
  return moment.taken_at || moment.created_at;
}

export function formatMemoryDate(
  moment: { taken_at?: string | null; created_at: string },
  format: "full" | "short" = "full"
): string {
  const dateStr = getMemoryDateString(moment);
  const d = new Date(dateStr);

  if (isNaN(d.getTime())) {
    return "";
  }

  if (format === "short") {
    return d.toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return d.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formats a date string to YYYY-MM-DD for standard HTML <input type="date">
 */
export function toInputDateFormat(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
