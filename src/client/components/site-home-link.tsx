import { Link } from "react-router";

export function SiteHomeLink() {
  return (
    <Link
      aria-label="Go to homepage"
      className="group -ml-3 grid size-11 place-items-center text-foreground no-underline"
      to="/"
    >
      <svg
        aria-hidden="true"
        className="size-5 transition-opacity duration-150 group-hover:opacity-70 group-focus-within:opacity-70"
        fill="currentColor"
        focusable="false"
        shapeRendering="crispEdges"
        viewBox="0 0 17 17"
      >
        <path
          clipRule="evenodd"
          d="M0 1h15v15H0V1Zm1 1v13h13V2H1Zm3 2h7v2H6v2h5v2H6v4H4V4Z"
          fillRule="evenodd"
        />
      </svg>
    </Link>
  );
}
