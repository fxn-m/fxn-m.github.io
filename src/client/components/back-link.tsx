import { Link } from "react-router";

export function BackLink() {
  return (
    <Link
      aria-label="Back to home"
      className="absolute -top-[0.2rem] -left-10 grid size-8 place-items-center rounded-full text-[1.1rem] text-muted no-underline hover:bg-surface hover:text-foreground focus-visible:bg-surface focus-visible:text-foreground"
      to="/"
    >
      ←
    </Link>
  );
}
