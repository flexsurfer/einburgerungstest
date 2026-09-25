const paths = {
  home: "m3 10 9-7 9 7v10H3V10Zm6 10v-7h6v7",
  book: "M12 5v16M3 3c4-1 7 0 9 2 2-2 5-3 9-2v15c-4-1-7 0-9 3-2-3-5-4-9-3V3Z",
  play: "m8 4 12 8-12 8V4Z",
  bookmark: "M6 3h12v18l-6-4-6 4V3Z",
  mistakes: "M9 9l6 6m0-6-6 6M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  exam: "M9 3H5v18h14V3h-4M9 2h6v4H9V2Zm-1 9 2 2 5-4m-7 8h8",
  settings: "M4 7h16M4 17h16M9 4v6m6 4v6",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  chevron: "m9 5 7 7-7 7",
  check: "m5 12 4 4L19 6",
  sun: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  moon: "M20.5 13A9 9 0 0 1 11 3.5 9 9 0 1 0 20.5 13Z",
  globe:
    "M2 12h20M12 2c6 5 6 15 0 20-6-5-6-15 0-20Zm10 10a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  map: "m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16",
  clock: "M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  building: "m3 8 9-5 9 5H3Zm2 3v7m5-7v7m4-7v7m5-7v7M3 21h18",
  grid: "M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z",
  close: "m6 6 12 12M6 18 18 6",
  menu: "M4 6h16M4 12h16M4 18h16",
};
export function UiIcon({ name, size = 21, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.book} />
    </svg>
  );
}
