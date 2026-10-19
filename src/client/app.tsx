import { GitHubLogoIcon, LinkedInLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import { Outlet } from "react-router";

import { WritingList } from "./components/blog";
import { PageContainer } from "./components/page-container";
import ThemeToggle from "./components/theme/theme-toggle";

export function HomePage() {
  return (
    <PageContainer as="main" className="flex flex-1 flex-col pb-6 text-base leading-[1.6]">
      <h1 className="font-pixel text-2xl">Felix Newport-Mangell</h1>

      <section className="mt-10">
        <p>
          Founder @{" "}
          <a
            className="text-inherit underline underline-offset-[0.15em]"
            href="https://joinef.com"
            rel="noreferrer"
            target="_blank"
          >
            EF
          </a>
          , based in London.
        </p>
        <nav aria-label="Social links and theme" className="mt-6 text-muted">
          <ul className="flex list-none items-center justify-end gap-1 p-0 pr-12">
            <li>
              <a
                aria-label="X"
                className="grid size-8 place-items-center text-inherit hover:text-foreground focus-visible:text-foreground"
                href="https://x.com/fxn__m"
                rel="noreferrer"
                target="_blank"
                title="X"
              >
                <TwitterLogoIcon aria-hidden="true" className="size-4" />
              </a>
            </li>
            <li>
              <a
                aria-label="GitHub"
                className="grid size-8 place-items-center text-inherit hover:text-foreground focus-visible:text-foreground"
                href="https://github.com/fxn-m"
                rel="noreferrer"
                target="_blank"
                title="GitHub"
              >
                <GitHubLogoIcon aria-hidden="true" className="size-4" />
              </a>
            </li>
            <li>
              <a
                aria-label="LinkedIn"
                className="grid size-8 place-items-center text-inherit hover:text-foreground focus-visible:text-foreground"
                href="https://www.linkedin.com/in/fxn-m"
                rel="noreferrer"
                target="_blank"
                title="LinkedIn"
              >
                <LinkedInLogoIcon aria-hidden="true" className="size-4" />
              </a>
            </li>
            <li>
              <ThemeToggle />
            </li>
          </ul>
        </nav>
      </section>

      <section className="mt-10">
        <WritingList />
      </section>
    </PageContainer>
  );
}

export default function App() {
  return (
    <div className="flex min-h-dvh flex-col bg-background pt-20 font-sans text-foreground md:pt-[clamp(4rem,14vh,8rem)]">
      <Outlet />
    </div>
  );
}
