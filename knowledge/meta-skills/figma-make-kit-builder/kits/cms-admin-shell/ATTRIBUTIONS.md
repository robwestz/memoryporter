# Attributions — cms-admin-shell

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
The block rich-text editor is implemented without Tiptap — a lightweight
block-renderer is used instead to keep the dependency surface minimal and the
kit portable.

If full collaborative rich-text is required for production use, integrate
`@tiptap/react` + `@tiptap/starter-kit` (MIT) and replace the `BlockCard`
renderer in `BlockRichTextEditor.tsx`.
