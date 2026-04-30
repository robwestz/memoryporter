import { useState } from "react";
import { Stack, Inline } from "@/lib/layout";
import type { Role, Invite } from "../types";
import { SeatCostPreview } from "./SeatCostPreview";

export type InviteMemberModalProps = {
  currentSeatCount: number;
  planLimit: number;
  costPerExtraSeat: number;
  availableRoles: Role[];
  onSend: (invite: Invite) => Promise<void>;
};

export function InviteMemberModal({ currentSeatCount, planLimit, costPerExtraSeat, availableRoles, onSend }: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>(availableRoles[0] ?? "viewer");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSend = async () => {
    if (!isValidEmail) return;
    setSending(true);
    setError(null);
    try { await onSend({ email, role }); setSent(true); setEmail(""); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to send invite"); }
    finally { setSending(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.32)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: "var(--z-modal)" }}>
      <div style={{ width: "480px", background: "var(--color-surface-overlay)", borderRadius: "var(--radius-xl)", boxShadow: "var(--elev-4)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "var(--space-24)", borderBottom: "1px solid var(--color-border-subtle)" }}>
          <div style={{ fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--color-text-primary)" }}>Invite member</div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginTop: "var(--space-4)" }}>They'll receive an email with a join link.</div>
        </div>

        {/* Body */}
        <div style={{ padding: "var(--space-24)" }}>
          <Stack gap={16}>
            {sent ? (
              <div style={{ padding: "var(--space-24)", textAlign: "center", color: "var(--color-success)", fontSize: "var(--text-base)", fontWeight: 500 }}>
                Invite sent!
              </div>
            ) : (
              <>
                {/* Email */}
                <div>
                  <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "var(--space-8)" }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    style={{ width: "100%", padding: "var(--space-8) var(--space-12)", fontSize: "var(--text-sm)", border: `1px solid ${isValidEmail || !email ? "var(--color-border-default)" : "var(--color-danger)"}`, borderRadius: "var(--radius-md)", background: "var(--color-surface-base)", color: "var(--color-text-primary)", boxSizing: "border-box" }}
                  />
                </div>

                {/* Role */}
                <div>
                  <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "var(--space-8)" }}>
                    Role
                  </label>
                  <Inline gap={8}>
                    {availableRoles.map((r) => (
                      <button key={r} onClick={() => setRole(r)} style={{ padding: "var(--space-8) var(--space-16)", fontSize: "var(--text-sm)", fontWeight: 500, border: `1px solid ${role === r ? "var(--color-accent-default)" : "var(--color-border-subtle)"}`, borderRadius: "var(--radius-md)", background: role === r ? "var(--color-accent-subtle)" : "var(--color-surface-base)", color: role === r ? "var(--color-text-accent)" : "var(--color-text-secondary)", cursor: "pointer", textTransform: "capitalize" }}>
                        {r}
                      </button>
                    ))}
                  </Inline>
                </div>

                <SeatCostPreview currentSeatCount={currentSeatCount} planLimit={planLimit} costPerExtraSeat={costPerExtraSeat} addingCount={1} />

                {error && <div style={{ fontSize: "var(--text-sm)", color: "var(--color-danger)" }}>{error}</div>}
              </>
            )}
          </Stack>
        </div>

        {/* Footer */}
        {!sent && (
          <div style={{ padding: "var(--space-16) var(--space-24)", borderTop: "1px solid var(--color-border-subtle)", background: "var(--color-surface-raised)" }}>
            <Inline justify="end" gap={8}>
              <button style={{ padding: "var(--space-8) var(--space-16)", fontSize: "var(--text-sm)", fontWeight: 500, border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-md)", background: "var(--color-surface-base)", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!isValidEmail || sending}
                style={{ padding: "var(--space-8) var(--space-24)", fontSize: "var(--text-sm)", fontWeight: 600, border: "none", borderRadius: "var(--radius-md)", background: isValidEmail ? "var(--color-accent-default)" : "var(--color-surface-sunken)", color: isValidEmail ? "var(--color-text-inverted)" : "var(--color-text-tertiary)", cursor: isValidEmail ? "pointer" : "not-allowed", opacity: sending ? 0.7 : 1 }}
              >
                {sending ? "Sending…" : "Send invite"}
              </button>
            </Inline>
          </div>
        )}
      </div>
    </div>
  );
}
