import type { CSSProperties, ReactNode } from "react";

type SpacingToken = 0 | 4 | 8 | 12 | 16 | 24 | 32 | 48 | 64;

type StackProps = {
  gap?: SpacingToken;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function Stack({
  gap = 16,
  align = "stretch",
  justify = "start",
  as: Tag = "div",
  className = "",
  style,
  children
}: StackProps) {
  const ElementTag = Tag as "div";
  return (
    <ElementTag
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: `var(--space-${gap})`,
        alignItems: alignMap[align],
        justifyContent: justifyMap[justify],
        ...style
      }}
    >
      {children}
    </ElementTag>
  );
}

const alignMap = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch"
} as const;

const justifyMap = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around"
} as const;
