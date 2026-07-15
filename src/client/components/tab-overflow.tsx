import { useQuery } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { useEffect, useMemo, useRef, useState } from "react";

import { type TabSuggestion, tabOverflowQueryOptions } from "../api/tab-overflow";
import { BackLink } from "./back-link";

const EMPTY_ITEMS: TabSuggestion[] = [];
const tableHeadingClassName =
  "border-b border-line px-2 py-[0.45rem] text-left text-xs font-medium tracking-[0.05em] text-muted uppercase";
const tableCellClassName =
  "border-b border-line px-2 py-[0.45rem] align-middle text-sm leading-[1.25] text-muted";
const emptyTableCellClassName =
  "border-b border-line px-2 py-8 text-center text-sm leading-[1.25] text-muted";

function pickRandomId(items: TabSuggestion[], currentId: string | null = null) {
  if (items.length === 0) {
    return null;
  }

  if (items.length === 1) {
    return items[0].id;
  }

  let nextId = currentId;
  while (nextId === currentId) {
    nextId = items[Math.floor(Math.random() * items.length)].id;
  }
  return nextId;
}

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(date);
}

export function TabOverflowView() {
  const {
    data: items = EMPTY_ITEMS,
    isError,
    isPending,
    isSuccess,
  } = useQuery(tabOverflowQueryOptions());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const suggestionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (items.length > 0 && !selectedId) {
      setSelectedId(pickRandomId(items));
    }
  }, [items, selectedId]);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );
  const search = useMemo(
    () =>
      new Fuse(items, {
        ignoreLocation: true,
        keys: [
          { name: "name", weight: 0.45 },
          { name: "summary", weight: 0.25 },
          { name: "categories", weight: 0.15 },
          { name: "author", weight: 0.1 },
          { name: "url", weight: 0.05 },
        ],
        threshold: 0.35,
      }),
    [items],
  );
  const trimmedSearchQuery = searchQuery.trim();
  const filteredItems = useMemo(
    () =>
      trimmedSearchQuery ? search.search(trimmedSearchQuery).map((result) => result.item) : items,
    [items, search, trimmedSearchQuery],
  );

  const selectFromTable = (id: string) => {
    setSelectedId(id);
    window.requestAnimationFrame(() => {
      suggestionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <main className="relative mx-auto mb-16 w-[min(50rem,calc(100%-5rem))] leading-[1.6]">
      <BackLink />

      <header className="mb-11 max-w-[34rem]">
        <h1 className="mb-[0.4rem] text-[1.75rem] leading-[1.2] font-bold">Tab Overflow</h1>
        <p className="text-muted">Things I opened with good intentions and saved for later.</p>
      </header>

      {isPending && <p className="text-muted">Loading tabs…</p>}
      {isError && <p className="text-muted">Tab Overflow is unavailable right now.</p>}

      {isSuccess && selectedItem && (
        <article
          className="w-full scroll-mt-8 border-y border-line pt-[1.4rem] pb-7"
          ref={suggestionRef}
        >
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">
              Try this one
            </p>
            <button
              className="cursor-pointer border-0 bg-transparent p-0 text-[0.8rem] text-muted underline underline-offset-[0.15em] hover:text-foreground focus-visible:text-foreground"
              onClick={() => setSelectedId((currentId) => pickRandomId(items, currentId))}
              type="button"
            >
              Another
            </button>
          </div>

          <h2 className="mt-[0.9rem] mb-3 text-2xl leading-[1.25] font-bold">
            {selectedItem.url ? (
              <a
                className="text-inherit underline decoration-1 underline-offset-[0.15em]"
                href={selectedItem.url}
                rel="noreferrer"
                target="_blank"
              >
                {selectedItem.name} ↗
              </a>
            ) : (
              selectedItem.name
            )}
          </h2>

          <p className="line-clamp-5 max-w-[46rem] leading-[1.65] text-foreground">
            {selectedItem.summary || "No introduction is available for this item yet."}
          </p>

          <dl className="mt-7 grid grid-cols-3 gap-6 max-[42rem]:grid-cols-2">
            {selectedItem.author && (
              <div>
                <dt className="mb-[0.15rem] text-[0.7rem] tracking-[0.06em] text-muted uppercase">
                  Author
                </dt>
                <dd className="m-0 text-[0.8rem] leading-[1.4]">{selectedItem.author}</dd>
              </div>
            )}
            <div>
              <dt className="mb-[0.15rem] text-[0.7rem] tracking-[0.06em] text-muted uppercase">
                Read
              </dt>
              <dd className="m-0 text-[0.8rem] leading-[1.4]">
                {selectedItem.readingTime ? `${selectedItem.readingTime} min` : "—"}
              </dd>
            </div>
            <div>
              <dt className="mb-[0.15rem] text-[0.7rem] tracking-[0.06em] text-muted uppercase">
                Added
              </dt>
              <dd className="m-0 text-[0.8rem] leading-[1.4]">
                {formatDate(selectedItem.added) ?? "—"}
              </dd>
            </div>
          </dl>
        </article>
      )}

      <section className="mt-14 w-full max-w-none">
        <header className="mb-3 flex items-center justify-between gap-4 max-[42rem]:items-start max-[42rem]:flex-col">
          <h2 className="text-base font-bold">All tabs</h2>
          <div className="flex items-center gap-3 max-[42rem]:w-full">
            <label className="sr-only" htmlFor="tab-overflow-search">
              Search tabs
            </label>
            <input
              className="w-48 border-0 border-b border-line bg-transparent py-[0.3rem] text-xs text-foreground outline-0 placeholder:text-xs placeholder:text-muted focus:border-foreground max-[42rem]:min-w-0 max-[42rem]:flex-1"
              disabled={!isSuccess}
              id="tab-overflow-search"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search tabs"
              type="search"
              value={searchQuery}
            />
            <p className="text-xs text-muted">
              {trimmedSearchQuery ? `${filteredItems.length} of ` : ""}
              {items.length} saved
            </p>
          </div>
        </header>

        <div className="w-full max-w-full overflow-x-auto overscroll-x-contain border-t border-line">
          <table className="w-full min-w-[50rem] table-fixed border-collapse">
            <colgroup>
              <col className="w-[25rem]" />
              <col className="w-[4.5rem]" />
              <col className="w-[18rem]" />
              <col className="w-10" />
            </colgroup>
            <thead>
              <tr>
                <th className={tableHeadingClassName} scope="col">
                  Name
                </th>
                <th className={tableHeadingClassName} scope="col">
                  Read
                </th>
                <th className={tableHeadingClassName} scope="col">
                  Categories
                </th>
                <th aria-label="Open" className={tableHeadingClassName} scope="col" />
              </tr>
            </thead>
            <tbody>
              {isPending ? (
                <tr>
                  <td className={emptyTableCellClassName} colSpan={4}>
                    Loading tabs…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td className={emptyTableCellClassName} colSpan={4}>
                    Tab Overflow is unavailable right now.
                  </td>
                </tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr className={item.id === selectedId ? "bg-surface" : undefined} key={item.id}>
                    <td className={tableCellClassName}>
                      <button
                        className="block w-full cursor-pointer overflow-hidden border-0 bg-transparent p-0 text-left text-ellipsis whitespace-nowrap text-foreground hover:underline hover:underline-offset-[0.15em] focus-visible:underline focus-visible:underline-offset-[0.15em]"
                        onClick={() => selectFromTable(item.id)}
                        type="button"
                      >
                        {item.name}
                      </button>
                    </td>
                    <td className={tableCellClassName}>
                      {item.readingTime ? `${item.readingTime} min` : "—"}
                    </td>
                    <td className={`${tableCellClassName} relative max-w-0 overflow-hidden`}>
                      <div className="absolute inset-[0.45rem_0.5rem] overflow-x-auto overflow-y-hidden whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {item.categories.join(", ") || "—"}
                      </div>
                    </td>
                    <td className={tableCellClassName}>
                      {item.url && (
                        <a
                          aria-label={`Open ${item.name}`}
                          className="text-base text-muted no-underline hover:text-foreground focus-visible:text-foreground"
                          href={item.url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          ↗
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className={emptyTableCellClassName} colSpan={4}>
                    {trimmedSearchQuery ? "No matching tabs." : "No saved tabs."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
