import type { ComponentPropsWithoutRef } from "react";

type PageContainerProps = ComponentPropsWithoutRef<"div"> & {
  as?: "div" | "main";
};

export function PageContainer({
  as: Component = "div",
  className = "",
  ...props
}: PageContainerProps) {
  return (
    <Component
      className={`mx-auto w-[min(50rem,calc(100%-2rem))] md:w-[min(50rem,calc(100%-5rem))] ${className}`}
      data-page-container=""
      {...props}
    />
  );
}
