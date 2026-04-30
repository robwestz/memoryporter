import type { CSSProperties, ReactNode } from "react";

type CenterProps = {
  maxWidth?: "form" | "reading" | "app" | number;
  padding?: 4 | 8 | 12 | 16 | 24 | 32 | 48 | 64;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

const maxWidthMap = {
  form: "640px",
  reading: "960px",
  app: "1440px"
} as const;

export function Center({
  maxWidth = "app",
  padding,
  className = "",
  style,
  children
}: CenterProps) {
  const resolvedMaxWidth =
    typeof maxWidth === "number" ? `${maxWidth}px` : maxWidthMap[maxWidth];

  return (
    <div
      className={className}
      style={{
        maxWidth: resolvedMaxWidth,
        marginInline: "auto",
        padding: padding ? `var(--space-${padding})` : undefined,
        width: "100%",
        ...style
      }}
    >
      {children}
    </div>
  );
}
