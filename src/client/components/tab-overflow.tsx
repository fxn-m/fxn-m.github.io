import { Cross2Icon, ExternalLinkIcon, UpdateIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { type TabSuggestion, tabOverflowQueryOptions } from "../api/tab-overflow";
import { BackLink } from "./back-link";

const EMPTY_ITEMS: TabSuggestion[] = [];
const tableHeadingClassName =
  "border-b border-line px-2 py-1.5 text-left text-[0.68rem] leading-4 font-medium tracking-[0.05em] text-muted uppercase";
const tableCellClassName =
  "border-b border-line px-2 py-1.5 align-middle text-[0.78rem] leading-4 text-muted";
const emptyTableCellClassName =
  "border-b border-line px-2 py-7 text-center text-[0.78rem] leading-4 text-muted";
const descriptionHeightClassName = "h-[8.25rem]";
const suggestionCardClassName = "w-full border-y border-line pt-[1.4rem] pb-7";
const loadingTableRows = Array.from({ length: 8 }, (_, index) => index);

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

function TabSuggestionSkeleton() {
  return (
    <article
      aria-busy="true"
      aria-label="Loading tab suggestion"
      className={`${suggestionCardClassName} animate-pulse motion-reduce:animate-none`}
      role="status"
    >
      <div aria-hidden="true">
        <div className="flex items-baseline justify-between gap-4">
          <div className="h-[1.875rem] w-3/5 rounded-sm bg-surface" />
          <div className="h-3 w-12 rounded-sm bg-surface" />
        </div>

        <div className={`${descriptionHeightClassName} mt-3 space-y-[0.9rem] py-1`}>
          <div className="h-3 w-full rounded-sm bg-surface" />
          <div className="h-3 w-11/12 rounded-sm bg-surface" />
          <div className="h-3 w-full rounded-sm bg-surface" />
          <div className="h-3 w-4/5 rounded-sm bg-surface" />
          <div className="h-3 w-2/3 rounded-sm bg-surface" />
        </div>

        <div className="mt-7 flex flex-wrap gap-x-12 gap-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="space-y-2" key={index}>
              <div className="h-2.5 w-12 rounded-sm bg-surface" />
              <div className="h-3 w-20 rounded-sm bg-surface" />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
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
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const suggestionRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (items.length === 0) {
      return;
    }

    const selectionIsAvailable = items.some((item) => item.id === selectedId);
    if (!selectionIsAvailable) {
      setSelectedId(pickRandomId(items, selectedId));
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

  const clearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  return (
    <main className="relative mx-auto mb-16 w-[min(50rem,calc(100%-5rem))] leading-[1.6]">
      <BackLink />

      <header className="mb-11 max-w-[34rem]">
        <h1 className="mb-[0.4rem] text-[1.75rem] leading-[1.2] font-bold">Tab Overflow</h1>
        <p className="text-muted">Things I opened with good intentions and saved for later.</p>
      </header>

      {isPending && <TabSuggestionSkeleton />}
      {isError && <p className="text-muted">Tab Overflow is unavailable right now.</p>}

      {isSuccess && selectedItem && (
        <article className={`${suggestionCardClassName} scroll-mt-8`} ref={suggestionRef}>
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <h2 className="min-w-0 flex-1 text-2xl leading-[1.25] font-bold">
              {selectedItem.url ? (
                <a
                  className="text-inherit underline decoration-1 underline-offset-[0.15em] line-clamp-1"
                  href={selectedItem.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {selectedItem.name}
                  <ExternalLinkIcon
                    aria-hidden="true"
                    className="ml-1 inline-block size-[0.75em] align-baseline"
                  />
                </a>
              ) : (
                selectedItem.name
              )}
            </h2>
            <button
              className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 border border-line bg-transparent px-2.5 py-1 text-[0.8rem] text-muted transition-colors duration-150 hover:border-foreground hover:text-foreground focus-visible:border-foreground focus-visible:text-foreground"
              onClick={() => setSelectedId(pickRandomId(items, selectedId))}
              type="button"
            >
              <UpdateIcon aria-hidden="true" className="size-3.5" />
              Another
            </button>
          </div>

          <p
            className={`${descriptionHeightClassName} line-clamp-5 leading-[1.65] text-foreground`}
          >
            {selectedItem.summary || "No introduction is available for this item yet."}
          </p>

          <dl className="mt-7 flex flex-wrap gap-x-12 gap-y-4">
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
          <h2 className="text-base font-bold">All</h2>
          <div className="flex items-center gap-3 max-[42rem]:w-full">
            <label className="sr-only" htmlFor="tab-overflow-search">
              Search tabs
            </label>
            <div className="relative w-48 border-b border-line focus-within:border-foreground max-[42rem]:min-w-0 max-[42rem]:flex-1">
              <input
                className="w-full border-0 bg-transparent py-[0.3rem] pr-6 text-xs text-foreground outline-0 placeholder:text-xs placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
                disabled={!isSuccess}
                id="tab-overflow-search"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search tabs"
                ref={searchInputRef}
                type="search"
                value={searchQuery}
              />
              {searchQuery && (
                <button
                  aria-label="Clear search"
                  className="absolute inset-y-0 right-0 grid w-6 cursor-pointer place-items-center border-0 bg-transparent p-0 text-sm text-muted hover:text-foreground focus-visible:text-foreground"
                  onClick={clearSearch}
                  type="button"
                >
                  <Cross2Icon aria-hidden="true" className="size-3.5" />
                </button>
              )}
            </div>
            <p className="min-w-20 text-right text-xs text-muted tabular-nums">
              {isPending ? (
                <span
                  aria-hidden="true"
                  className="inline-block h-3 w-16 animate-pulse rounded-sm bg-surface align-middle motion-reduce:animate-none"
                />
              ) : (
                `${items.length} saved`
              )}
            </p>
          </div>
        </header>

        <div className="w-full max-w-full overflow-x-auto overscroll-x-contain border-t border-line">
          <table className="w-full min-w-[50rem] table-fixed border-collapse font-geist-mono">
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
                loadingTableRows.map((row) => (
                  <tr
                    aria-hidden="true"
                    className="animate-pulse motion-reduce:animate-none"
                    key={row}
                  >
                    <td className={tableCellClassName}>
                      <div className="h-3 w-4/5 rounded-sm bg-surface" />
                    </td>
                    <td className={tableCellClassName}>
                      <div className="h-3 w-10 rounded-sm bg-surface" />
                    </td>
                    <td className={`${tableCellClassName} max-w-0 overflow-hidden`}>
                      <div className="h-3 w-3/5 rounded-sm bg-surface" />
                    </td>
                    <td className={tableCellClassName}>
                      <div className="ml-auto h-3 w-3 rounded-sm bg-surface" />
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td className={emptyTableCellClassName} colSpan={4}>
                    Tab Overflow is unavailable right now.
                  </td>
                </tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr
                    aria-label={`Show ${item.name}`}
                    aria-selected={item.id === selectedId}
                    className={`group cursor-pointer transition-colors hover:bg-surface focus-visible:bg-surface focus-visible:outline-1 focus-visible:outline-offset-[-1px] focus-visible:outline-foreground ${
                      item.id === selectedId ? "bg-surface" : ""
                    }`}
                    key={item.id}
                    onClick={(event) => {
                      if (event.target instanceof Element && event.target.closest("a")) {
                        return;
                      }

                      selectFromTable(item.id);
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.target !== event.currentTarget ||
                        (event.key !== "Enter" && event.key !== " ")
                      ) {
                        return;
                      }

                      event.preventDefault();
                      selectFromTable(item.id);
                    }}
                    tabIndex={0}
                  >
                    <td className={tableCellClassName}>
                      <span className="block w-full overflow-hidden text-left text-ellipsis whitespace-nowrap text-foreground group-hover:underline group-hover:underline-offset-[0.15em] group-focus-visible:underline group-focus-visible:underline-offset-[0.15em]">
                        {item.name}
                      </span>
                    </td>
                    <td className={tableCellClassName}>
                      {item.readingTime ? `${item.readingTime} min` : "—"}
                    </td>
                    <td className={`${tableCellClassName} max-w-0 overflow-hidden`}>
                      <div className="overflow-x-auto overflow-y-hidden whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {item.categories.join(", ") || "—"}
                      </div>
                    </td>
                    <td className={tableCellClassName}>
                      {item.url && (
                        <a
                          aria-label={`Open ${item.name}`}
                          className="mx-auto inline-grid size-5 place-items-center text-muted no-underline hover:text-foreground focus-visible:text-foreground"
                          href={item.url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <ExternalLinkIcon aria-hidden="true" className="size-3.5" />
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
