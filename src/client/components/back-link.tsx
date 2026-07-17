import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { Link } from "react-router";

export function BackLink() {
  return (
    <Link
      aria-label="Back to home"
      className="absolute -top-[0.2rem] -left-10 grid size-8 place-items-center text-foreground no-underline opacity-60 transition-opacity duration-150 hover:opacity-90 focus-visible:opacity-90"
      to="/"
    >
      <ArrowLeftIcon aria-hidden="true" className="size-5" />
    </Link>
  );
}
