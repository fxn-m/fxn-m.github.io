import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";

import { BackLink } from "./back-link";
import { PageContainer } from "./page-container";
import { SiteHomeLink } from "./site-home-link";
import ThemeToggle from "./theme/theme-toggle";

const hideAfterScroll = 96;
const revealAfterUpwardScroll = 48;

export function TopBar() {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const previousScrollY = useRef(0);
  const upwardScroll = useRef(0);
  const isVisibleRef = useRef(true);

  const updateVisibility = (visible: boolean) => {
    if (isVisibleRef.current === visible) {
      return;
    }

    isVisibleRef.current = visible;
    setIsVisible(visible);
  };

  useEffect(() => {
    previousScrollY.current = window.scrollY;
    upwardScroll.current = 0;
    updateVisibility(true);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const scrollDelta = currentScrollY - previousScrollY.current;

      if (currentScrollY <= hideAfterScroll / 2) {
        upwardScroll.current = 0;
        updateVisibility(true);
      } else if (scrollDelta > 0) {
        upwardScroll.current = 0;
        if (currentScrollY > hideAfterScroll) {
          updateVisibility(false);
        }
      } else if (scrollDelta < 0 && !isVisibleRef.current) {
        upwardScroll.current += Math.abs(scrollDelta);
        if (upwardScroll.current >= revealAfterUpwardScroll) {
          upwardScroll.current = 0;
          updateVisibility(true);
        }
      }

      previousScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-20 bg-background transition-transform duration-200 ease-out motion-reduce:transition-none ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
      data-top-bar=""
      data-visible={isVisible}
      onFocusCapture={() => updateVisibility(true)}
    >
      <PageContainer className="flex h-14 items-center justify-between">
        <div className="relative ml-1 flex items-center">
          {pathname !== "/" && (
            <div className="absolute top-1/2 right-[calc(100%-0.25rem)] -translate-y-1/2 sm:right-full">
              <BackLink />
            </div>
          )}
          <SiteHomeLink />
        </div>
        <ThemeToggle />
      </PageContainer>
    </header>
  );
}
