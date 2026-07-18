import type { SVGProps } from "react";

type ThemeIconProps = SVGProps<SVGSVGElement>;

export function SunIcon(props: ThemeIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      focusable="false"
      shapeRendering="crispEdges"
      viewBox="0 0 17 17"
      {...props}
    >
      <path d="M8 0h1v3H8zM2 2h2v1H2zM13 2h2v1h-2zM3 3h2v1H3zM12 3h2v1h-2zM6 4h5v1H6zM5 5h2v1H5zM10 5h2v1h-2zM4 6h2v4H4zM11 6h2v4h-2zM0 8h3v1H0zM14 8h3v1h-3zM5 10h1v1H5zM11 10h1v1h-1zM5 11h7v1H5zM6 12h4v1H6zM3 13h2v1H3zM12 13h2v1h-2zM2 14h2v1H2zM13 14h2v1h-2zM8 14h1v3H8z" />
    </svg>
  );
}

export function MoonIcon(props: ThemeIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      focusable="false"
      shapeRendering="crispEdges"
      viewBox="0 0 17 17"
      {...props}
    >
      <path
        d="M5 1h5v1H5zM4 2h5v1H4zM3 3h5v1H3zM2 4h5v4H2zM2 8h6v1H2zM2 9h7v1H2zM2 10h8v1H2zM14 10h1v1h-1zM2 11h13v1H2zM3 12h12v1H3zM4 13h10v1H4zM5 14h8v1H5z"
        transform="translate(2)"
      />
    </svg>
  );
}
