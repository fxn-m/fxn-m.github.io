const projects = [
  {
    icon: "/projects/oelp-chicken.gif",
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
    icon: null,
    name: "Tab Overflow",
  },
];

export default function App() {
  return (
    <main className="content">
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua.
      </p>

      <section>
        <h2>Writing</h2>
        <ul>
          <li>Change Makers: Geohot</li>
        </ul>
      </section>

      <section>
        <h2>Projects</h2>
        <ul className="project-list">
          {projects.map((project) => (
            <li className="project" key={project.name}>
              {project.icon ? (
                <img alt="" className="project-icon" src={project.icon} />
              ) : (
                <span aria-hidden="true" className="project-icon project-mark">
                  TO
                </span>
              )}
              <span>{project.name}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
