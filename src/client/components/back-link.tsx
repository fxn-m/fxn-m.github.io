import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { Link } from "react-router";

export function BackLink() {
  return (
    <Link
      aria-label="Back to home"
      className="grid size-6 place-items-center text-foreground no-underline transition-opacity duration-150 hover:opacity-70 focus-visible:opacity-70"
      to="/"
    >
      <ArrowLeftIcon aria-hidden="true" className="size-3.5" />
    </Link>
  );
}
