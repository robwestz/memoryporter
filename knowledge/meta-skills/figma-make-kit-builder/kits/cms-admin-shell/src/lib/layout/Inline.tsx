import type { CSSProperties, ReactNode } from "react";

type SpacingToken = 0 | 4 | 8 | 12 | 16 | 24 | 32 | 48 | 64;

type InlineProps = {
  gap?: SpacingToken;
  align?: "start" | "center" | "end" | "baseline" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  wrap?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function Inline({
  gap = 8,
  align = "center",
  justify = "start",
  wrap = true,
  className = "",
  style,
  children
}: InlineProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: wrap ? "wrap" : "nowrap",
        gap: `var(--space-${gap})`,
        alignItems: alignMap[align],
        justifyContent: justifyMap[justify],
        ...style
      }}
    >
      {children}
    </div>
  );
}

const alignMap = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  baseline: "baseline",
  stretch: "stretch"
} as const;

const justifyMap = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around"
} as const;
