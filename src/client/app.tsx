import { useState } from "react";

import type { BlogPost } from "@/shared";

import { BlogView, WritingList } from "./components/blog";
import { TabOverflowView } from "./components/tab-overflow";
import ThemeToggle from "./components/theme/theme-toggle";

type ActiveView = { kind: "home" } | { kind: "blog"; post: BlogPost } | { kind: "tab-overflow" };

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
    action: "tab-overflow",
    icon: null,
    name: "Tab Overflow",
  },
];

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>({ kind: "home" });

  const goHome = () => setActiveView({ kind: "home" });

  return (
    <>
      <ThemeToggle />
      {activeView.kind === "blog" ? (
        <BlogView onBack={goHome} post={activeView.post} />
      ) : activeView.kind === "tab-overflow" ? (
        <TabOverflowView onBack={goHome} />
      ) : (
        <main className="content">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>

          <section>
            <h2>Writing</h2>
            <WritingList onSelect={(post) => setActiveView({ kind: "blog", post })} />
          </section>

          <section>
            <h2>Projects</h2>
            <ul className="project-list">
              {projects.map((project) => (
                <li className="project" key={project.name}>
                  {project.action === "tab-overflow" ? (
                    <a
                      className="project-row project-link"
                      href="#tab-overflow"
                      onClick={(event) => {
                        event.preventDefault();
                        setActiveView({ kind: "tab-overflow" });
                      }}
                    >
                      <span aria-hidden="true" className="project-icon project-mark">
                        TO
                      </span>
                      <span className="project-name">{project.name}</span>
                    </a>
                  ) : (
                    <div className="project-row">
                      {project.icon && <img alt="" className="project-icon" src={project.icon} />}
                      <span>{project.name}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </main>
      )}
    </>
  );
}
