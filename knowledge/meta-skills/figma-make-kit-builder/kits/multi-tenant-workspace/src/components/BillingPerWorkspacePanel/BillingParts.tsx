import { Inline, Stack } from "@/lib/layout";

// ---- UsageMeterRow ---------------------------------------------------------

export type UsageMeterRowProps = {
  label: string;
  used: number;
  limit: number;
  format: (v: number) => string;
};

export function UsageMeterRow({ label, used, limit, format }: UsageMeterRowProps) {
  const pct = Math.min(100, (used / limit) * 100);
  const isNearLimit = pct >= 80;
  const isAtLimit = pct >= 100;

  return (
    <div>
      <Inline justify="between" align="center" style={{ marginBottom: "var(--space-8)" }}>
        <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-text-primary)" }}>{label}</span>
        <span style={{ fontSize: "var(--text-xs)", color: isAtLimit ? "var(--color-danger)" : isNearLimit ? "var(--color-warning)" : "var(--color-text-secondary)" }}>
          {format(used)} / {format(limit)}
        </span>
      </Inline>
      <div style={{ height: "var(--space-8)", background: "var(--color-border-subtle)", borderRadius: "var(--radius-pill)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: isAtLimit ? "var(--color-danger)" : isNearLimit ? "var(--color-warning)" : "var(--color-accent-default)", borderRadius: "var(--radius-pill)", transition: `width var(--motion-slow)` }} />
      </div>
      {isNearLimit && !isAtLimit && (
        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-warning)", marginTop: "var(--space-4)" }}>Approaching limit — consider upgrading.</div>
      )}
      {isAtLimit && (
        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-danger)", marginTop: "var(--space-4)" }}>Limit reached. Upgrade to continue.</div>
      )}
    </div>
  );
}

// ---- StatCard --------------------------------------------------------------

export type StatCardProps = { label: string; value: string; sub?: string };

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div style={{ padding: "var(--space-16)", background: "var(--color-surface-raised)", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-lg)" }}>
      <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginBottom: "var(--space-4)", fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--color-text-primary)" }}>{value}</div>
      {sub && <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginTop: "var(--space-4)" }}>{sub}</div>}
    </div>
  );
}

// ---- Helpers ---------------------------------------------------------------

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)}GB`;
}

export function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date);
}
