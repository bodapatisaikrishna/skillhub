/** Display helpers shared across components. Pure, client-safe. */

/** Compact star count: 1234 -> "1.2k", 12345 -> "12k". */
export function formatStars(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(n < 10000 ? 1 : 0)}k`;
}

/** Absolute date like "Jun 23, 2026" from an ISO string; "" if invalid. */
export function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
