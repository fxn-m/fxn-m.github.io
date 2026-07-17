import { Cross2Icon, ExternalLinkIcon, ShuffleIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { type TabSuggestion, tabOverflowQueryOptions } from "../api/tab-overflow";
import { PageContainer } from "./page-container";

const EMPTY_ITEMS: TabSuggestion[] = [];
const tableCellClassName =
  "border-b border-line px-2 py-1.5 align-middle text-[0.78rem] leading-4 text-muted";
const emptyTableCellClassName =
  "border-b border-line px-2 py-7 text-center text-[0.78rem] leading-4 text-muted";
const categoryChipClassName =
  "inline-block shrink-0 bg-surface px-2 py-1 text-[0.7rem] leading-4 text-foreground lowercase";
const descriptionHeightClassName = "h-[6.4rem] sm:h-33";
const suggestionCardClassName = "w-full border-y border-line pt-4 pb-5 sm:pt-[1.4rem] sm:pb-7";
const loadingTableRows = Array.from({ length: 8 }, (_, index) => index);
const mobilePageSize = 24;

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const updateMatches = () => setMatches(mediaQuery.matches);

    updateMatches();
    mediaQuery.addEventListener("change", updateMatches);
    return () => mediaQuery.removeEventListener("change", updateMatches);
  }, [query]);

  return matches;
}

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
        <div className="h-7.5 w-3/5 rounded-sm bg-surface" />

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
  const [mobileVisibleCount, setMobileVisibleCount] = useState(mobilePageSize);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const suggestionRef = useRef<HTMLElement | null>(null);
  const isTableLayout = useMediaQuery("(min-width: 56rem)");

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
  const visibleMobileItems = filteredItems.slice(0, mobileVisibleCount);

  const selectFromTable = (id: string) => {
    setSelectedId(id);
    window.requestAnimationFrame(() => {
      suggestionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setMobileVisibleCount(mobilePageSize);
    searchInputRef.current?.focus();
  };

  return (
    <PageContainer as="main" className="mb-16 leading-[1.6]">
      <header className="mb-7 max-w-136 sm:mb-11">
        <h1 className="mb-[0.4rem] text-[1.625rem] leading-[1.2] font-bold sm:text-[1.75rem]">
          Tab Overflow
        </h1>
        <p className="text-[0.9375rem] text-muted sm:text-base">
          Things I opened with good intentions and saved for later.
        </p>
      </header>

      {isPending && <TabSuggestionSkeleton />}
      {isError && <p className="text-muted">Tab Overflow is unavailable right now.</p>}

      {isSuccess && selectedItem && (
        <article className={`${suggestionCardClassName} scroll-mt-8`} ref={suggestionRef}>
          <h2 className="mb-2 min-w-0 text-lg leading-tight font-bold sm:mb-3 sm:text-2xl">
            {selectedItem.url ? (
              <a
                className="text-inherit underline decoration-1 underline-offset-[0.15em] line-clamp-2 sm:line-clamp-1"
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

          <p className="line-clamp-4 text-sm leading-[1.6] text-foreground sm:h-33 sm:line-clamp-5 sm:text-base sm:leading-[1.65]">
            {selectedItem.summary || "No introduction is available for this item yet."}
          </p>

          <div className="mt-5 flex items-end justify-between gap-3 sm:mt-7 sm:gap-5">
            <dl className="grid min-w-0 flex-1 grid-cols-3 gap-x-4 sm:flex sm:flex-wrap sm:gap-x-12">
              {selectedItem.author && (
                <div className="min-w-0">
                  <dt className="mb-[0.15rem] text-[0.625rem] tracking-[0.06em] text-muted uppercase sm:text-[0.7rem]">
                    Author
                  </dt>
                  <dd className="m-0 line-clamp-1 text-xs leading-[1.4] sm:text-[0.8rem]">
                    {selectedItem.author}
                  </dd>
                </div>
              )}
              <div className="min-w-0">
                <dt className="mb-[0.15rem] text-[0.625rem] tracking-[0.06em] text-muted uppercase sm:text-[0.7rem]">
                  Read
                </dt>
                <dd className="m-0 line-clamp-1 text-xs leading-[1.4] sm:text-[0.8rem]">
                  {selectedItem.readingTime ? `${selectedItem.readingTime} min` : "—"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="mb-[0.15rem] text-[0.625rem] tracking-[0.06em] text-muted uppercase sm:text-[0.7rem]">
                  Added
                </dt>
                <dd className="m-0 line-clamp-1 text-xs leading-[1.4] sm:text-[0.8rem]">
                  {formatDate(selectedItem.added) ?? "—"}
                </dd>
              </div>
            </dl>
            <button
              aria-label="Show another random tab"
              className="inline-flex min-h-8 w-fit shrink-0 cursor-pointer items-center gap-1 border-0 bg-transparent p-0 font-geist-mono text-[0.7rem] text-muted hover:text-foreground hover:underline hover:underline-offset-[0.15em] focus-visible:text-foreground focus-visible:underline focus-visible:underline-offset-[0.15em] sm:min-h-0 sm:gap-1.5 sm:pb-[0.15rem] sm:text-xs"
              onClick={() => setSelectedId(pickRandomId(items, selectedId))}
              type="button"
            >
              <ShuffleIcon aria-hidden="true" className="size-3 sm:size-3.5" />
              Shuffle
            </button>
          </div>
        </article>
      )}

      <section className="mt-8 w-full max-w-none sm:mt-14">
        <header className="mb-2 flex flex-col items-start gap-2 min-[56rem]:mb-3 min-[56rem]:flex-row min-[56rem]:items-center min-[56rem]:justify-between min-[56rem]:gap-4">
          <h2 className="text-base font-bold">All</h2>
          <div className="flex w-full items-center gap-3 min-[56rem]:w-auto">
            <label className="sr-only" htmlFor="tab-overflow-search">
              Search tabs
            </label>
            <div className="relative min-w-0 flex-1 border-b border-line focus-within:border-foreground min-[56rem]:w-48 min-[56rem]:flex-none">
              <input
                className="min-h-11 w-full border-0 bg-transparent py-2 pr-9 text-base text-foreground outline-0 placeholder:text-base placeholder:text-muted min-[56rem]:min-h-0 min-[56rem]:py-[0.3rem] min-[56rem]:pr-6 min-[56rem]:text-xs min-[56rem]:placeholder:text-xs [&::-webkit-search-cancel-button]:hidden"
                disabled={!isSuccess}
                id="tab-overflow-search"
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setMobileVisibleCount(mobilePageSize);
                }}
                placeholder="Search tabs"
                ref={searchInputRef}
                type="search"
                value={searchQuery}
              />
              {searchQuery && (
                <button
                  aria-label="Clear search"
                  className="absolute inset-y-0 right-0 grid w-11 cursor-pointer place-items-center border-0 bg-transparent p-0 text-sm text-muted hover:text-foreground focus-visible:text-foreground min-[56rem]:w-6"
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
                `${trimmedSearchQuery ? filteredItems.length : items.length} ${
                  trimmedSearchQuery ? "found" : "saved"
                }`
              )}
            </p>
          </div>
        </header>

        {isTableLayout ? (
          <div className="w-full max-w-full overflow-x-auto overscroll-x-contain border-t border-line">
            <table
              aria-label="Saved tabs"
              className="w-full min-w-200 table-fixed border-collapse font-geist-mono"
            >
              <colgroup>
                <col className="w-100" />
                <col className="w-18" />
                <col className="w-[18rem]" />
                <col className="w-10" />
              </colgroup>
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
                      className={`group cursor-pointer transition-colors hover:bg-surface focus-visible:bg-surface focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-foreground ${
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
                        {item.categories.length > 0 ? (
                          <div className="flex gap-1 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-none [&::-webkit-scrollbar]:hidden">
                            {item.categories.map((category) => (
                              <span className={categoryChipClassName} key={category}>
                                {category}
                              </span>
                            ))}
                          </div>
                        ) : (
                          "—"
                        )}
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
        ) : (
          <div className="border-t border-line">
            {isPending ? (
              <div
                aria-busy="true"
                aria-label="Loading saved tabs"
                className="divide-y divide-line"
                role="status"
              >
                {loadingTableRows.map((row) => (
                  <div className="animate-pulse py-4 motion-reduce:animate-none" key={row}>
                    <div className="h-4 w-4/5 rounded-sm bg-surface" />
                    <div className="mt-3 h-3 w-2/5 rounded-sm bg-surface" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <p className="border-b border-line py-7 text-center text-sm text-muted">
                Tab Overflow is unavailable right now.
              </p>
            ) : visibleMobileItems.length > 0 ? (
              <>
                <ul className="m-0 list-none divide-y divide-line p-0">
                  {visibleMobileItems.map((item) => (
                    <li className={item.id === selectedId ? "bg-surface" : ""} key={item.id}>
                      <div className="flex min-h-16 items-center gap-2 py-2">
                        <button
                          aria-label={`Show ${item.name}`}
                          className="min-h-11 min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0 text-left font-geist-mono text-sm leading-5 text-foreground"
                          onClick={() => selectFromTable(item.id)}
                          type="button"
                        >
                          <span className="line-clamp-2">{item.name}</span>
                          <span className="mt-1 block text-[0.7rem] leading-4 text-muted">
                            {item.readingTime ? `${item.readingTime} min` : "No read time"}
                          </span>
                          {item.categories.length > 0 && (
                            <span className="mt-2 flex flex-wrap gap-1">
                              {item.categories.map((category) => (
                                <span className={categoryChipClassName} key={category}>
                                  {category}
                                </span>
                              ))}
                            </span>
                          )}
                        </button>
                        {item.url && (
                          <a
                            aria-label={`Open ${item.name}`}
                            className="mt-1 grid size-11 shrink-0 place-items-center self-start text-muted no-underline hover:text-foreground focus-visible:text-foreground"
                            href={item.url}
                            rel="noreferrer"
                            target="_blank"
                          >
                            <ExternalLinkIcon aria-hidden="true" className="size-4" />
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                {visibleMobileItems.length < filteredItems.length && (
                  <button
                    className="mt-4 min-h-11 w-full cursor-pointer border border-line bg-transparent px-4 text-sm text-muted transition-colors hover:border-foreground hover:text-foreground focus-visible:border-foreground focus-visible:text-foreground"
                    onClick={() => setMobileVisibleCount((count) => count + mobilePageSize)}
                    type="button"
                  >
                    Show{" "}
                    {Math.min(mobilePageSize, filteredItems.length - visibleMobileItems.length)}{" "}
                    more
                  </button>
                )}
              </>
            ) : (
              <p className="border-b border-line py-7 text-center text-sm text-muted">
                {trimmedSearchQuery ? "No matching tabs." : "No saved tabs."}
              </p>
            )}
          </div>
        )}
      </section>
    </PageContainer>
  );
}
