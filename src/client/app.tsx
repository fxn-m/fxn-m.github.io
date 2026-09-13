import { GitHubLogoIcon, LinkedInLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import { Outlet } from "react-router";

import { WritingList } from "./components/blog";
import { PageContainer } from "./components/page-container";
import { TopBar } from "./components/top-bar";

const buildDate = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})
  .format(new Date(__BUILD_DATE__))
  .replaceAll("/", "-");

export function HomePage() {
  return (
    <PageContainer as="main" className="flex flex-1 flex-col pb-6 text-base leading-[1.6]">
      <h1 className="font-pixel text-2xl">Felix Newport-Mangell</h1>

      <section className="mt-10">
        <p>I'm a software engineer based in London.</p>
        <p>
          Previously founding engineer at Kenobi.ai (YC W22), I'm having some downtime before the
          next thing.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 font-bold">Writing</h2>
        <WritingList />
      </section>

      <footer className="mt-auto flex items-center justify-between gap-4 pt-16 text-xs text-muted">
        <p>
          Last updated: <time dateTime={__BUILD_DATE__}>{buildDate}</time>
        </p>
        <nav aria-label="Social links">
          <ul className="flex list-none items-center gap-1 p-0">
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
          </ul>
        </nav>
      </footer>
    </PageContainer>
  );
}

export default function App() {
  return (
    <div className="flex min-h-dvh flex-col bg-background pt-20 font-sans text-foreground md:pt-[clamp(4rem,14vh,8rem)]">
      <TopBar />
      <Outlet />
    </div>
  );
}
