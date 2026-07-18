import {
  ExternalLinkIcon,
  GitHubLogoIcon,
  LinkedInLogoIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link, Outlet } from "react-router";

import { tabOverflowQueryOptions } from "./api/tab-overflow";
import { WritingList } from "./components/blog";
import { PageContainer } from "./components/page-container";
import { TopBar } from "./components/top-bar";

const projects = [
  {
    href: "https://oelp.app",
    icon: "/projects/oelp-logo.ico",
    name: "Oelp",
  },
  {
    href: "https://pousse.page",
    icon: "/projects/pousse-logo.png",
    name: "Pousse",
  },
  {
    href: "/tab-overflow",
    icon: null,
    name: "Tab Overflow",
  },
];

const buildDate = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})
  .format(new Date(__BUILD_DATE__))
  .replaceAll("/", "-");

export function HomePage() {
  const queryClient = useQueryClient();
  const prefetchTabOverflow = () => {
    void queryClient.prefetchQuery(tabOverflowQueryOptions());
  };

  useEffect(prefetchTabOverflow, [queryClient]);

  return (
    <PageContainer as="main" className="flex flex-1 flex-col pb-6 leading-[1.6]">
      <h1 className="font-pixel text-2xl">Felix Newport-Mangell</h1>

      <section className="mt-10">
        <p>I'm a software engineer based in London.</p>
        <p>Previously founding engineer at Kenobi.ai (YC W22), I'm having some downtime before the next thing.</p>
      </section>

      <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-x-16">
        <section>
          <h2 className="mb-3 text-base font-bold">Writing</h2>
          <WritingList />
        </section>

        <section>
          <h2 className="mb-3 text-base font-bold">Projects</h2>
          <ul className="m-0 list-none p-0">
            {projects.map((project) => (
              <li className="[&+&]:mt-1" key={project.name}>
                {project.href.startsWith("http") ? (
                  <a
                    className="group flex min-h-11 w-fit items-center gap-3 text-inherit no-underline"
                    href={project.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <img
                      alt=""
                      className="size-7 shrink-0 rounded-[0.3rem] object-cover"
                      src={project.icon ?? undefined}
                    />
                    <span className="inline-flex items-center gap-1.5 underline underline-offset-[0.15em]">
                      {project.name}
                      <ExternalLinkIcon aria-hidden="true" className="size-3.5" />
                    </span>
                  </a>
                ) : (
                  <Link
                    className="group flex min-h-11 w-fit items-center gap-3 text-inherit no-underline"
                    onFocus={prefetchTabOverflow}
                    onMouseEnter={prefetchTabOverflow}
                    to={project.href}
                  >
                    <span
                      aria-hidden="true"
                      className="grid size-7 shrink-0 place-items-center rounded-[0.3rem] bg-surface text-[0.625rem] font-semibold text-muted"
                    >
                      TO
                    </span>
                    <span className="underline underline-offset-[0.15em]">{project.name}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>

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
    <div className="flex min-h-dvh flex-col bg-background pt-20 font-sans text-foreground [font-synthesis:none] md:pt-[clamp(4rem,14vh,8rem)]">
      <TopBar />
      <Outlet />
    </div>
  );
}
