import Fuse from "fuse.js";
import { useEffect, useMemo, useRef, useState } from "react";

import type { TabOverflowItem } from "@/shared";

import { type RemoteResourceReader, useRemoteResource } from "../hooks/use-remote-resource";

type TabSuggestion = {
  added: string | null;
  author: string | null;
  categories: string[];
  id: string;
  name: string;
  readingTime: number | null;
  summary: string;
  url: string | null;
};

const DEFAULT_BACKEND_URL = "https://fxn-m-api.fxn-m.workers.dev";
const backendUrl = (import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/$/, "");

function mapTabOverflowItem(item: TabOverflowItem): TabSuggestion {
  const properties = item.properties ?? {};

  return {
    added: properties.Added?.date?.start ?? null,
    author: properties.Author?.select?.name ?? null,
    categories:
      properties.Categories?.multi_select
        ?.map((category) => category.name)
        .filter((category): category is string => Boolean(category)) ?? [],
    id: item.id,
    name: properties.Name?.title?.[0]?.plain_text || "Untitled",
    readingTime: properties["Read Time"]?.number ?? null,
    summary:
      properties.Summary?.rich_text
        ?.map((text) => text.plain_text)
        .filter((text): text is string => Boolean(text))
        .join(" ") ?? "",
    url: properties.URL?.url ?? null,
  };
}

const readTabOverflow: RemoteResourceReader<TabSuggestion[]> = async (response) =>
  ((await response.json()) as TabOverflowItem[]).map(mapTabOverflowItem);

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

export function TabOverflowView({ onBack }: { onBack: () => void }) {
  const state = useRemoteResource(`${backendUrl}/tab-overflow`, readTabOverflow);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const suggestionRef = useRef<HTMLElement | null>(null);

  const items = state.status === "ready" ? state.data : [];

  useEffect(() => {
    if (state.status === "ready" && !selectedId) {
      setSelectedId(pickRandomId(state.data));
    }
  }, [selectedId, state]);
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
    <main className="content detail-view tab-overflow-view">
      <button aria-label="Back to home" className="view-back" onClick={onBack} type="button">
        ←
      </button>

      <header className="tab-overflow-header">
        <h1>Tab Overflow</h1>
        <p>Things I opened with good intentions and saved for later.</p>
      </header>

      {state.status === "loading" && <p className="tab-overflow-status">Loading tabs…</p>}
      {state.status === "error" && (
        <p className="tab-overflow-status">Tab Overflow is unavailable right now.</p>
      )}

      {state.status === "ready" && selectedItem && (
        <article className="tab-suggestion" ref={suggestionRef}>
          <div className="tab-suggestion-heading">
            <p className="tab-suggestion-label">Try this one</p>
            <button
              className="tab-another"
              onClick={() => setSelectedId((currentId) => pickRandomId(items, currentId))}
              type="button"
            >
              Another
            </button>
          </div>

          <h2>
            {selectedItem.url ? (
              <a href={selectedItem.url} rel="noreferrer" target="_blank">
                {selectedItem.name} ↗
              </a>
            ) : (
              selectedItem.name
            )}
          </h2>

          <p className="tab-suggestion-summary">
            {selectedItem.summary || "No introduction is available for this item yet."}
          </p>

          <dl className="tab-metadata">
            {selectedItem.author && (
              <div>
                <dt>Author</dt>
                <dd>{selectedItem.author}</dd>
              </div>
            )}
            <div>
              <dt>Read</dt>
              <dd>{selectedItem.readingTime ? `${selectedItem.readingTime} min` : "—"}</dd>
            </div>
            <div>
              <dt>Added</dt>
              <dd>{formatDate(selectedItem.added) ?? "—"}</dd>
            </div>
          </dl>
        </article>
      )}

      <section className="tab-library">
        <header>
          <h2>All tabs</h2>
          <div className="tab-library-tools">
            <label className="visually-hidden" htmlFor="tab-overflow-search">
              Search tabs
            </label>
            <input
              disabled={state.status !== "ready"}
              id="tab-overflow-search"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search tabs"
              type="search"
              value={searchQuery}
            />
            <p>
              {trimmedSearchQuery ? `${filteredItems.length} of ` : ""}
              {items.length} saved
            </p>
          </div>
        </header>

        <div className="tab-table-scroll">
          <table className="tab-table">
            <colgroup>
              <col className="tab-col-name" />
              <col className="tab-col-read" />
              <col className="tab-col-categories" />
              <col className="tab-col-open" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Read</th>
                <th scope="col">Categories</th>
                <th aria-label="Open" scope="col" />
              </tr>
            </thead>
            <tbody>
              {state.status === "loading" ? (
                <tr>
                  <td className="tab-table-empty" colSpan={4}>
                    Loading tabs…
                  </td>
                </tr>
              ) : state.status === "error" ? (
                <tr>
                  <td className="tab-table-empty" colSpan={4}>
                    Tab Overflow is unavailable right now.
                  </td>
                </tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr className={item.id === selectedId ? "is-selected" : undefined} key={item.id}>
                    <td>
                      <button
                        className="tab-row-select"
                        onClick={() => selectFromTable(item.id)}
                        type="button"
                      >
                        {item.name}
                      </button>
                    </td>
                    <td>{item.readingTime ? `${item.readingTime} min` : "—"}</td>
                    <td>
                      <div className="tab-categories-scroll">
                        {item.categories.join(", ") || "—"}
                      </div>
                    </td>
                    <td>
                      {item.url && (
                        <a
                          aria-label={`Open ${item.name}`}
                          className="tab-row-open"
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
                  <td className="tab-table-empty" colSpan={4}>
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
