import "./styles/tailwind.css";
import "./styles/index.css";
import "./styles/fonts.css";

/**
 * App.tsx — kit composition entry.
 *
 * Replace the <KitShell> placeholder with the kit's actual shell (e.g.,
 * <CmsAdminShell />, <WorkflowBuilderShell />). The shell is the outermost
 * component; it should compose the kit's headline components from
 * guidelines/components.md.
 *
 * Foundation-lock: do not import layout primitives from anywhere except
 * `@/lib/layout`. Do not redefine `Stack`, `Inline`, etc.
 */

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-base)] text-[var(--color-text-primary)] font-sans">
      <KitShell />
    </div>
  );
}

function KitShell() {
  return (
    <main className="max-w-[1440px] mx-auto p-[var(--space-24)]">
      <h1 className="text-[var(--text-3xl)] font-bold">
        Kit scaffold — replace with real shell
      </h1>
      <p className="mt-[var(--space-16)] text-[var(--color-text-secondary)]">
        See <code>guidelines/components.md</code> for the kit's headline
        components. Compose them here inside a layout primitive from{" "}
        <code>@/lib/layout</code>.
      </p>
    </main>
  );
}
