import type { BlogPost } from "@/shared";

import { type RemoteResourceReader, useRemoteResource } from "../hooks/use-remote-resource";

const readBlogIndex: RemoteResourceReader<BlogPost[]> = async (response) => {
  const posts = (await response.json()) as BlogPost[];
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const readBlogContent: RemoteResourceReader<string> = (response) => response.text();

export function WritingList({ onSelect }: { onSelect: (post: BlogPost) => void }) {
  const index = useRemoteResource("/html/index.json", readBlogIndex);

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
  const state = useRemoteResource(`/html/${post.slug}.html`, readBlogContent);

  return (
    <main className="blog-view content detail-view">
      <button aria-label="Back to home" className="view-back" onClick={onBack} type="button">
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
