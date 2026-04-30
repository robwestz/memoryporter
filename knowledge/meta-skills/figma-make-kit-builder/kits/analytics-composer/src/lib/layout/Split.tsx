import type { CSSProperties, ReactNode } from "react";

type SplitProps = {
  direction?: "horizontal" | "vertical";
  primary: ReactNode;
  secondary: ReactNode;
  primarySize?: string;
  secondarySize?: string;
  primaryFlex?: number;
  secondaryFlex?: number;
  className?: string;
  style?: CSSProperties;
};

export function Split({
  direction = "horizontal",
  primary,
  secondary,
  primarySize,
  secondarySize,
  primaryFlex,
  secondaryFlex,
  className = "",
  style
}: SplitProps) {
  const isHorizontal = direction === "horizontal";

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: isHorizontal ? "row" : "column",
        minHeight: 0,
        minWidth: 0,
        ...style
      }}
    >
      <div
        style={{
          flexBasis: primarySize,
          flexGrow: primaryFlex ?? (primarySize ? 0 : 1),
          flexShrink: primarySize ? 0 : 1,
          minWidth: 0,
          minHeight: 0
        }}
      >
        {primary}
      </div>
      <div
        style={{
          flexBasis: secondarySize,
          flexGrow: secondaryFlex ?? (secondarySize ? 0 : 1),
          flexShrink: secondarySize ? 0 : 1,
          minWidth: 0,
          minHeight: 0
        }}
      >
        {secondary}
      </div>
    </div>
  );
}
