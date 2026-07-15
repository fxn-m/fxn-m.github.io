# Tailwind CSS with React/Vite

Research date: 2026-07-15

## Recommendation

Use Tailwind CSS v4's first-party Vite plugin. Tailwind recommends `@tailwindcss/vite` over its PostCSS integration for Vite projects, and the official setup is to register the plugin in `vite.config.ts` and import Tailwind from the app's global CSS. [Tailwind: Vite installation](https://tailwindcss.com/docs/installation/using-vite) [Tailwind: v4 upgrade guide](https://tailwindcss.com/docs/upgrade-guide#using-vite)

This repo already has the required, matching `tailwindcss` and `@tailwindcss/vite` 4.3.2 packages alongside Vite 8.1.4, so no dependency change is needed. [`package.json`](../../package.json) The official plugin package declares support for Vite 8. [Tailwind plugin package source](https://github.com/tailwindlabs/tailwindcss/blob/main/packages/%40tailwindcss-vite/package.json#L37-L39)

Apply this Vite configuration:

```ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],
});
```

Vite supports multiple plugins in its `plugins` array, so Tailwind can be added without replacing the existing React plugin. [Vite: using plugins](https://vite.dev/guide/using-plugins.html#adding-a-plugin)

For this existing re-skin, initially import Tailwind's theme and utilities **without Preflight** at the top of `src/main.css`:

```css
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
```

The normal one-line `@import "tailwindcss";` also injects Tailwind's opinionated Preflight base reset, including removal of list markers. Tailwind explicitly documents split imports with the Preflight import omitted for integration into an existing project. [Tailwind: disabling Preflight](https://tailwindcss.com/docs/preflight#disabling-preflight) [Tailwind package import source](https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/index.css) Omitting it is the safer fit for the requirement to preserve presentation because the current stylesheet still relies on browser list styling in places. [`src/main.css`](../../src/main.css)

Implementation note: the completed migration replaced those browser-dependent component styles with explicit Tailwind utilities and moved generated article typography into a scoped CSS module. That makes the standard `@import "tailwindcss"` (including Preflight) safe in the final code while keeping `src/main.css` limited to Tailwind setup and global theme tokens.

No `tailwind.config.js`, PostCSS config, or `content` glob is needed for this repo. Tailwind v4 automatically scans project sources, while `@source`/`source()` is only needed for ignored external files or a nonstandard base path. [Tailwind: source detection](https://tailwindcss.com/docs/detecting-classes-in-source-files#which-files-are-scanned) [Tailwind: setting the base path](https://tailwindcss.com/docs/detecting-classes-in-source-files#setting-your-base-path)

Keep utility class names as complete static strings in TSX rather than constructing fragments such as `bg-${color}-600`; Tailwind scans source as text and cannot infer dynamically assembled names. [Tailwind: dynamic class names](https://tailwindcss.com/docs/detecting-classes-in-source-files#dynamic-class-names)

Tailwind v4 targets Safari 16.4+, Chrome 111+, and Firefox 128+; verify that this matches the site's browser-support policy. [Tailwind: upgrade guide](https://tailwindcss.com/docs/upgrade-guide#browser-requirements)
