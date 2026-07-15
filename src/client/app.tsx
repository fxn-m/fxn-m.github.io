import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link, Outlet } from "react-router";

import { tabOverflowQueryOptions } from "./api/tab-overflow";
import { WritingList } from "./components/blog";
import ThemeToggle from "./components/theme/theme-toggle";

const projects = [
  {
    icon: "/projects/oelp-logo.ico",
    name: "Où est le poulet",
  },
  {
    icon: "/projects/pousse-logo.png",
    name: "Pousse",
  },
  {
    icon: "/projects/pgt-logo.png",
    name: "PGT",
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
    <main className="mx-auto mb-16 w-[min(50rem,calc(100%-2rem))] leading-[1.6]">
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua.
      </p>

      <section className="mt-10">
        <h2 className="mb-3 text-base font-bold">Writing</h2>
        <WritingList />
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-base font-bold">Projects</h2>
        <ul className="m-0 list-none p-0">
          {projects.map((project) => (
            <li className="min-h-10 [&+&]:mt-2" key={project.name}>
              {project.href ? (
                <Link
                  className="group flex w-fit items-center gap-3 text-inherit no-underline"
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
              ) : (
                <div className="flex w-fit items-center gap-3 text-inherit no-underline">
                  {project.icon && (
                    <img
                      alt=""
                      className="size-7 shrink-0 rounded-[0.3rem] object-cover"
                      src={project.icon}
                    />
                  )}
                  <span>{project.name}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-background pt-[clamp(4rem,14vh,8rem)] font-sans text-foreground transition-colors duration-200 [font-synthesis:none]">
      <ThemeToggle />
      <Outlet />
    </div>
  );
}
