import "./styles/tailwind.css";
import "./styles/index.css";
import "./styles/fonts.css";
import { useState } from "react";
import { Inline } from "@/lib/layout";
import { WorkspaceSwitcher } from "../components/WorkspaceSwitcher";
import { InviteMemberModal } from "../components/InviteMemberModal";
import { RBACPermissionsMatrix } from "../components/RBACPermissionsMatrix";
import { BillingPerWorkspacePanel } from "../components/BillingPerWorkspacePanel";
import { TeamListTable } from "../components/TeamListTable";
import type { Workspace, Member, RoleDefinition, MemberAction } from "../components/types";
import { WORKSPACES, MEMBERS, ROLE_DEF, PLAN, USAGE, LIMITS, NEXT_INVOICE, PAYMENT_METHOD, RESOURCES, ACTIONS } from "./stubData";

type Tab = "team" | "roles" | "billing";
const TABS: Array<{ id: Tab; label: string }> = [
  { id: "team", label: "Team" },
  { id: "roles", label: "Roles & permissions" },
  { id: "billing", label: "Billing" },
];

export default function App() {
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(WORKSPACES[0]);
  const [activeTab, setActiveTab] = useState<Tab>("team");
  const [showInvite, setShowInvite] = useState(false);
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [roleDef, setRoleDef] = useState<RoleDefinition>(ROLE_DEF);
  const [roleDirty, setRoleDirty] = useState(false);

  function handleMemberAction(action: MemberAction) {
    if (action.type === "remove") {
      setMembers((prev) => prev.filter((m) => m.id !== action.memberId));
    } else if (action.type === "suspend") {
      setMembers((prev) => prev.map((m) => m.id === action.memberId ? { ...m, status: "suspended" as const } : m));
    } else if (action.type === "change-role") {
      setMembers((prev) => prev.map((m) => m.id === action.memberId ? { ...m, role: action.newRole } : m));
    }
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--color-surface-base)", color: "var(--color-text-primary)", fontFamily: "var(--font-sans)" }}>
      {/* Top bar */}
      <div style={{ padding: "0 var(--space-24)", borderBottom: "1px solid var(--color-border-subtle)", background: "var(--color-surface-raised)", display: "flex", alignItems: "center", gap: "var(--space-24)", flexShrink: 0, height: "56px" }}>
        <WorkspaceSwitcher
          current={activeWorkspace}
          available={WORKSPACES}
          onSwitch={(id) => { const ws = WORKSPACES.find((w) => w.id === id); if (ws) setActiveWorkspace(ws); }}
          onCreateNew={() => void 0}
          shortcut="cmd+k"
          recentFirst
        />
        <Inline gap={0} align="center" style={{ flex: 1 }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ padding: "var(--space-16) var(--space-24)", fontSize: "var(--text-sm)", fontWeight: 500, border: "none", borderBottom: `2px solid ${activeTab === tab.id ? "var(--color-accent-default)" : "transparent"}`, background: "transparent", color: activeTab === tab.id ? "var(--color-text-accent)" : "var(--color-text-secondary)", cursor: "pointer", height: "100%" }}
            >
              {tab.label}
            </button>
          ))}
        </Inline>
        {activeTab === "team" && (
          <button
            onClick={() => setShowInvite(true)}
            style={{ padding: "var(--space-8) var(--space-16)", fontSize: "var(--text-sm)", fontWeight: 600, border: "none", borderRadius: "var(--radius-md)", background: "var(--color-accent-default)", color: "var(--color-text-inverted)", cursor: "pointer" }}
          >
            + Invite member
          </button>
        )}
      </div>

      {/* Page content */}
      <div style={{ flex: 1, minHeight: 0, overflowY: activeTab === "billing" ? "auto" : "hidden" }}>
        {activeTab === "team" && (
          <TeamListTable
            members={members}
            filters={{ status: "all", role: "all" }}
            bulkActions={["change-role", "remove", "export"]}
            onMemberAction={handleMemberAction}
          />
        )}
        {activeTab === "roles" && (
          <RBACPermissionsMatrix
            role={roleDef}
            resources={RESOURCES}
            actions={ACTIONS}
            onChange={(r) => { setRoleDef(r); setRoleDirty(true); }}
            onSave={async (r) => { setRoleDef(r); setRoleDirty(false); }}
            dirty={roleDirty}
          />
        )}
        {activeTab === "billing" && (
          <BillingPerWorkspacePanel
            workspace={activeWorkspace}
            currentPlan={PLAN}
            usage={USAGE}
            limits={LIMITS}
            nextInvoice={NEXT_INVOICE}
            paymentMethod={PAYMENT_METHOD}
            onUpgrade={() => void 0}
            onDowngrade={() => void 0}
          />
        )}
      </div>

      {/* Invite modal */}
      {showInvite && (
        <InviteMemberModal
          currentSeatCount={members.filter((m) => m.status !== "invited").length}
          planLimit={LIMITS.seats}
          costPerExtraSeat={PLAN.pricePerSeat}
          availableRoles={["admin", "editor", "viewer"]}
          onSend={async (invite) => {
            setMembers((prev) => [...prev, {
              id: `m-${Date.now()}`,
              email: invite.email,
              role: invite.role,
              status: "invited",
              invitedAt: new Date(),
            }]);
            setShowInvite(false);
          }}
        />
      )}
    </div>
  );
}
