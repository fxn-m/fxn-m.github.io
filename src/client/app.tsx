import { ExternalLinkIcon } from "@radix-ui/react-icons";
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

export function HomePage() {
  const queryClient = useQueryClient();
  const prefetchTabOverflow = () => {
    void queryClient.prefetchQuery(tabOverflowQueryOptions());
  };

  useEffect(prefetchTabOverflow, [queryClient]);

  return (
    <PageContainer as="main" className="mb-16 leading-[1.6]">
      <p>Hey! You've reached Felix's homepage.</p>

      <section className="mt-10">
        <h2 className="mb-3 text-base font-bold">Writing</h2>
        <WritingList />
      </section>

      <section className="mt-10">
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
    </PageContainer>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-background pt-20 font-sans text-foreground [font-synthesis:none] md:pt-[clamp(4rem,14vh,8rem)]">
      <TopBar />
      <Outlet />
    </div>
  );
}
