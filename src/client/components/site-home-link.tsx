import { Link } from "react-router";

export function SiteHomeLink() {
  return (
    <Link
      aria-label="Home"
      className="flex min-h-11 items-center font-pixel text-md text-foreground no-underline transition-opacity duration-150 hover:opacity-70 focus-visible:opacity-70"
      to="/"
    >
      fxn-m.com
    </Link>
  );
}
