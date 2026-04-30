import type { CSSProperties, ReactNode } from "react";

type SpacingToken = 0 | 4 | 8 | 12 | 16 | 24 | 32 | 48 | 64;

type GridProps = {
  columns?: number | string;
  gap?: SpacingToken;
  rowGap?: SpacingToken;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function Grid({
  columns = 12,
  gap = 16,
  rowGap,
  className = "",
  style,
  children
}: GridProps) {
  const columnTemplate =
    typeof columns === "number"
      ? `repeat(${columns}, minmax(0, 1fr))`
      : columns;

  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: columnTemplate,
        columnGap: `var(--space-${gap})`,
        rowGap: `var(--space-${rowGap ?? gap})`,
        ...style
      }}
    >
      {children}
    </div>
  );
}

type GridItemProps = {
  colSpan?: number;
  colStart?: number;
  rowSpan?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function GridItem({
  colSpan,
  colStart,
  rowSpan,
  className = "",
  style,
  children
}: GridItemProps) {
  return (
    <div
      className={className}
      style={{
        gridColumn: colSpan ? `span ${colSpan} / span ${colSpan}` : undefined,
        gridColumnStart: colStart,
        gridRow: rowSpan ? `span ${rowSpan} / span ${rowSpan}` : undefined,
        ...style
      }}
    >
      {children}
    </div>
  );
}
