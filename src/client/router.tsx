import { useEffect } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router";

import App, { HomePage } from "./app";
import { getPostHog } from "./analytics/posthog";
import { BlogView } from "./components/blog";
import { TabOverflowView } from "./components/tab-overflow";

function PostHogPageviews() {
  const location = useLocation();

  useEffect(() => {
    let active = true;

    void getPostHog().then((posthog) => {
      if (active) {
        posthog?.capture("$pageview", {
          $current_url: window.location.href,
          $pathname: location.pathname,
        });
      }
    });

    return () => {
      active = false;
    };
  }, [location.pathname, location.search]);

  return null;
}

export function AppRouter() {
  return (
    <HashRouter>
      <PostHogPageviews />
      <Routes>
        <Route element={<App />} path="/">
          <Route element={<HomePage />} index />
          <Route element={<BlogView />} path="writing/:slug" />
          <Route element={<TabOverflowView />} path="tab-overflow" />
          <Route element={<Navigate replace to="/tab-overflow" />} path="fun/tab-overflow" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Route>
      </Routes>
    </HashRouter>
  );
}
