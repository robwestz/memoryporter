# Attributions — multi-tenant-workspace

## Third-party dependencies

### React
- License: MIT
- Copyright: Meta Platforms, Inc. and affiliates
- https://github.com/facebook/react/blob/main/LICENSE

### Vite
- License: MIT
- Copyright: 2019-present, Yuxi (Evan) You and Vite contributors
- https://github.com/vitejs/vite/blob/main/LICENSE

## Notes

No additional third-party UI libraries are used in this kit.
Dropdown/popover interactions (WorkspaceSwitcher, MemberRowActions) are
implemented with native state + click-outside handlers instead of Radix UI,
keeping the kit self-contained.

If complex popover positioning is required (e.g., viewport-edge detection),
add `@radix-ui/react-dropdown-menu` (MIT) and swap the custom dropdowns.
