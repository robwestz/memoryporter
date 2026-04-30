# Attributions — analytics-composer

## @dnd-kit/core + @dnd-kit/sortable + @dnd-kit/utilities

- **License:** MIT
- **Source:** https://github.com/clauderic/dnd-kit
- **Versions:** core ^6.3.1, sortable ^8.0.0, utilities ^3.2.2
- **Use:** Drag-and-drop reordering of widget cards on the WidgetCanvas.
  `@dnd-kit/core` provides the DndContext and sensor system; `@dnd-kit/sortable`
  provides the useSortable hook and SortableContext; `@dnd-kit/utilities`
  provides the CSS transform helper.
- **Why chosen:** Accessible by default (ARIA drag-and-drop attributes),
  supports PointerSensor for both mouse and touch, minimal bundle size vs
  react-beautiful-dnd. No global CSS required.

## @tanstack/react-virtual

- **License:** MIT
- **Source:** https://github.com/TanStack/virtual
- **Version:** ^3.10.9
- **Use:** Retained as a dependency for future filter result lists and
  analytics tables that may render inside the composer. Not actively
  invoked in WidgetCanvas but available for sub-panels.
- **Why chosen:** Consistent with power-data-table — single virtualizer
  dependency across the kit family.
