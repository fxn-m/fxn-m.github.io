import { useEffect, useState } from "react";

import type { BlogPost } from "@/shared";

type BlogAssetState<T> = { status: "loading" } | { data: T; status: "ready" } | { status: "error" };

type BlogAssetReader<T> = (response: Response) => Promise<T>;

const readBlogIndex: BlogAssetReader<BlogPost[]> = async (response) => {
  const posts = (await response.json()) as BlogPost[];
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const readBlogContent: BlogAssetReader<string> = (response) => response.text();

function useBlogAsset<T>(path: string, read: BlogAssetReader<T>): BlogAssetState<T> {
  const [state, setState] = useState<BlogAssetState<T>>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    const loadAsset = async () => {
      setState({ status: "loading" });

      try {
        const response = await fetch(path, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Unable to load blog asset: ${response.status}`);
        }

        setState({ data: await read(response), status: "ready" });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setState({ status: "error" });
        }
      }
    };

    void loadAsset();
    return () => controller.abort();
  }, [path, read]);

  return state;
}

export function WritingList({ onSelect }: { onSelect: (post: BlogPost) => void }) {
  const index = useBlogAsset("/html/index.json", readBlogIndex);

  if (index.status === "loading") {
    return <p className="blog-status">Loading…</p>;
  }

  if (index.status === "error") {
    return <p className="blog-status">Writing is unavailable right now.</p>;
  }

  return (
    <ul className="writing-list">
      {index.data.map((post) => (
        <li key={post.id}>
          <a
            href={`/html/${post.slug}.html`}
            onClick={(event) => {
              event.preventDefault();
              onSelect(post);
            }}
          >
            {post.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function BlogView({ onBack, post }: { onBack: () => void; post: BlogPost }) {
  const state = useBlogAsset(`/html/${post.slug}.html`, readBlogContent);

  return (
    <main className="blog-view content">
      <button aria-label="Back to home" className="blog-back" onClick={onBack} type="button">
        ←
      </button>

      <article>
        <header className="blog-header">
          <h1>{post.title}</h1>
          <time dateTime={post.date}>{post.date}</time>
        </header>

        {state.status === "loading" && <p className="blog-status">Loading…</p>}
        {state.status === "error" && <p className="blog-status">This piece could not be loaded.</p>}
        {state.status === "ready" && (
          <div className="blog-content" dangerouslySetInnerHTML={{ __html: state.data }} />
        )}
      </article>
    </main>
  );
}
