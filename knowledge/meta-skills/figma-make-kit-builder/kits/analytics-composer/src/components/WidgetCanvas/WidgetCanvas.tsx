import { useCallback } from "react";
import type { ReactNode } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Layout, Widget } from "../types";

type WidgetCanvasProps = {
  layout: Layout[];
  onLayoutChange: (l: Layout[]) => void;
  widgets: Widget[];
  gridColumns?: number;
  rowHeight?: number;
  renderWidget: (w: Widget) => ReactNode;
};

export function WidgetCanvas({
  layout,
  onLayoutChange,
  widgets,
  gridColumns = 12,
  rowHeight = 48,
  renderWidget,
}: WidgetCanvasProps) {
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 4 },
  }));

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const fromIndex = layout.findIndex((l) => l.i === active.id);
      const toIndex = layout.findIndex((l) => l.i === over.id);
      if (fromIndex === -1 || toIndex === -1) return;

      // Swap positions in layout
      const next = [...layout];
      const fromPos = { x: next[fromIndex].x, y: next[fromIndex].y };
      next[fromIndex] = { ...next[fromIndex], x: next[toIndex].x, y: next[toIndex].y };
      next[toIndex] = { ...next[toIndex], ...fromPos };
      onLayoutChange(next);
    },
    [layout, onLayoutChange]
  );

  const widgetIds = layout.map((l) => l.i);

  // Compute canvas height from layout
  const maxRow = layout.reduce((max, l) => Math.max(max, l.y + l.h), 0);
  const canvasHeight = maxRow * rowHeight + 16; // 16px bottom padding

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={widgetIds} strategy={rectSortingStrategy}>
        <div
          role="region"
          aria-label="Widget canvas"
          style={{
            position: "relative",
            width: "100%",
            minHeight: `${canvasHeight}px`,
            background: "var(--color-surface-sunken)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
              gap: "var(--space-16)",
              padding: "var(--space-16)",
            }}
          >
            {layout.map((item) => {
              const widget = widgets.find((w) => w.id === item.i);
              if (!widget) return null;
              return (
                <SortableWidget
                  key={item.i}
                  item={item}
                  widget={widget}
                  renderWidget={renderWidget}
                />
              );
            })}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
}

// --- Sortable sub-component ---

type SortableWidgetProps = {
  item: Layout;
  widget: Widget;
  renderWidget: (w: Widget) => ReactNode;
};

function SortableWidget({ item, widget, renderWidget }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.i });

  const style: React.CSSProperties = {
    gridColumn: `span ${item.w} / span ${item.w}`,
    gridRow: `span ${item.h} / span ${item.h}`,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: "var(--color-surface-raised)",
    borderRadius: "var(--radius-lg)",
    border: isDragging
      ? "2px dashed var(--color-accent-default)"
      : "1px solid var(--color-border-subtle)",
    boxShadow: isDragging ? "var(--elev-4)" : "var(--elev-1)",
    overflow: "hidden",
    cursor: "grab",
    position: "relative",
    zIndex: isDragging ? "var(--z-dropdown)" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {/* Drag handle indicator */}
      <div
        style={{
          padding: "var(--space-8) var(--space-12)",
          borderBottom: "1px solid var(--color-border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--color-surface-raised)",
          fontSize: "var(--text-sm)",
          fontWeight: 500,
          color: "var(--color-text-primary)",
        }}
      >
        <span>{widget.title}</span>
        <DragHandleIcon />
      </div>
      <div style={{ padding: "var(--space-16)" }}>
        {renderWidget(widget)}
      </div>
    </div>
  );
}

function DragHandleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="5" cy="3" r="1" fill="currentColor" />
      <circle cx="9" cy="3" r="1" fill="currentColor" />
      <circle cx="5" cy="7" r="1" fill="currentColor" />
      <circle cx="9" cy="7" r="1" fill="currentColor" />
      <circle cx="5" cy="11" r="1" fill="currentColor" />
      <circle cx="9" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}
