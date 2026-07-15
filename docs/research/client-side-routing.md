# Client-side routing for the static site

Research date: 2026-07-15

## Recommendation

Use **React Router 8.2 in Declarative Mode with `HashRouter`**. Define three URL-owned views:

- `/` — homepage
- `/writing/:slug` — writing detail
- `/tab-overflow` — Tab Overflow

On GitHub Pages these become shareable URLs such as `https://fxn-m.com/#/writing/change-makers-geohot`. React Router documents that `HashRouter` stores location in the URL fragment, which is not sent to the server; this avoids static-host deep-link failures. [React Router: `HashRouter`](https://reactrouter.com/api/declarative-routers/HashRouter) The current deployment uploads only the Vite `dist` directory to GitHub Pages and has no rewrite layer. [Repo deployment workflow](../../.github/workflows/deploy-client.yml) GitHub Pages documents `404.html` as a custom error response for nonexistent paths, not as a configurable rewrite to `index.html`; therefore a `BrowserRouter` route such as `/writing/foo` would require an unsupported redirect/fallback workaround or a deployment change. [GitHub Pages: custom 404](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site)

Install only `react-router@^8.2.0` and import `HashRouter`, `Routes`, `Route`, `Navigate`, `Link`, `useLocation`, and `useParams` from `react-router`. React Router 8.2.0 is the current release as of this note, and v8 removed the compatibility `react-router-dom` package. [React Router 8.2 release](https://reactrouter.com/start/start/changelog#v820) [React Router 8 removal of `react-router-dom`](https://reactrouter.com/start/start/changelog#removed-react-router-dom) The repo already matches v8's React 19.2.7 and Vite 7+ baselines; v8 also declares Node 22.22+ and ESM/ES2022, so the Bun-based CI build should be verified after installation. [React Router 8 baseline](https://reactrouter.com/start/start/changelog#baseline-support) [Repo package versions](../../package.json)

Use the route parameter as the source of truth for a writing detail. The route component should read `slug` with `useParams`, obtain the cached writing index, and resolve the matching post. Do not depend on a `post` object passed only through link state, because a shared or refreshed deep link has no preceding navigation state.

## Why Declarative Mode

React Router says Declarative Mode provides matching, navigation, links, and location, and recommends it when an app wants the simplest integration or already has its own data abstraction. Data Mode additionally introduces loaders, actions, pending states, and fetchers. [React Router: picking a mode](https://reactrouter.com/start/modes)

That maps directly to this app: TanStack Query is being introduced as the cache and prefetch layer, so React Router should own URLs and navigation while Query owns remote data. A Data Router (`createHashRouter`) would work on GitHub Pages, but its loader/revalidation lifecycle would add a second data-coordination abstraction without a current need. [React Router: `createHashRouter`](https://reactrouter.com/api/data-routers/createHashRouter)

Suggested shape (presentation components and CSS can remain unchanged):

```tsx
<HashRouter>
  <PostHogPageviews />
  <Routes>
    <Route element={<Home />} path="/" />
    <Route element={<WritingRoute />} path="/writing/:slug" />
    <Route element={<TabOverflowView />} path="/tab-overflow" />
    <Route element={<Navigate replace to="/" />} path="*" />
  </Routes>
</HashRouter>
```

Use `<Link>` for the writing, Tab Overflow, and back controls while retaining their existing class names. This restores browser back/forward behavior and opening links in a new tab without changing layout.

## PostHog pageviews with hash routing

Do **not** rely on PostHog's `capture_pageview: "history_change"` for this hash router. Although PostHog recommends that mode for conventional SPAs, its current implementation records a navigation only when `window.location.pathname` changes; a hash route changes `window.location.hash` while the pathname remains `/`. [PostHog configuration](https://posthog.com/docs/libraries/js/config) [PostHog history-autocapture source](https://github.com/PostHog/posthog-js/blob/main/packages/browser/src/extensions/history-autocapture.ts#L72-L90)

Instead, set `capture_pageview: false` and add one component inside `HashRouter` that captures on React Router's `useLocation()` changes. React Router explicitly documents `useLocation` as the hook for analytics side effects on navigation. [React Router: `useLocation`](https://reactrouter.com/api/hooks/useLocation) Capture `$pageview` with both the real hash URL and the logical route path, since PostHog's standard URL fields are `$current_url` and `$pathname`. [PostHog event properties](https://posthog.com/docs/data/events#default-properties)

```tsx
function PostHogPageviews() {
  const location = useLocation();
  const posthog = usePostHog();

  useEffect(() => {
    posthog?.capture("$pageview", {
      $current_url: window.location.href,
      $pathname: location.pathname,
    });
  }, [location.pathname, location.search, posthog]);

  return null;
}
```

Use exactly one strategy (`capture_pageview: false` plus the component above) so initial navigation and subsequent navigation are not double-counted.

## Leading alternative and complexity trade-off

| Option                                    | Static deep links                                                                                  | Data/prefetch model                                                              | Integration surface                                                                                                                                   | Fit here                                                                                    |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| React Router 8 Declarative + `HashRouter` | Safe without rewrites                                                                              | TanStack Query remains the only data cache                                       | One direct runtime package; no Vite router plugin or generated route tree                                                                             | **Best fit**                                                                                |
| React Router 8 Data + `createHashRouter`  | Safe without rewrites                                                                              | Adds loaders, actions, pending states, and fetchers                              | Route objects plus `RouterProvider`; overlaps with Query coordination                                                                                 | Useful only if route loaders/actions become a real requirement                              |
| TanStack Router + `createHashHistory`     | Safe without rewrites; TanStack explicitly recommends hash history where the server cannot rewrite | Strong route typing, built-in preload/SWR cache, and external Query coordination | Recommended file routing adds a Vite plugin and generated `routeTree.gen.ts`; code-based routing avoids generation but retains a larger setup surface | Excellent for a larger type/search-param-heavy app, disproportionate for these three routes |

TanStack's hash-hosting support is first-class, and its route cache/preloading are capable. [TanStack Router: history types](https://tanstack.com/router/latest/docs/guide/history-types#hash-routing) [TanStack Router: data loading and cache](https://tanstack.com/router/latest/docs/guide/data-loading) Its recommended file-based Vite setup, however, requires `@tanstack/router-plugin` and a generated route tree. [TanStack Router: Vite installation](https://tanstack.com/router/latest/docs/installation/with-vite) Those features overlap with the requested TanStack Query cache and add build/configuration surface that this small site does not currently benefit from.

No precise byte-size claim is made here: the honest comparison should come from this repo's production build after implementation. Architecturally, React Router Declarative Mode has the smallest direct integration surface of the leading options considered; React Router 8 is also ESM-only and targets ES2022. [React Router 8 baseline](https://reactrouter.com/start/start/changelog#baseline-support)
