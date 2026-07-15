import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router";

import { blogIndexQueryOptions, blogPostQueryOptions } from "../api/blog";
import { BackLink } from "./back-link";
import styles from "./blog-content.module.css";

export function WritingList() {
  const index = useQuery(blogIndexQueryOptions());
  const queryClient = useQueryClient();

  if (index.isPending) {
    return <p className="text-muted">Loading…</p>;
  }

  if (index.isError) {
    return <p className="text-muted">Writing is unavailable right now.</p>;
  }

  return (
    <ul className="m-0 list-disc pl-5">
      {index.data.map((post) => {
        const prefetchPost = () => {
          void queryClient.prefetchQuery(blogPostQueryOptions(post.slug));
        };

        return (
          <li key={post.id}>
            <Link
              className="text-inherit underline underline-offset-[0.15em]"
              onFocus={prefetchPost}
              onMouseEnter={prefetchPost}
              to={`/writing/${post.slug}`}
            >
              {post.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function BlogView() {
  const { slug = "" } = useParams();
  const index = useQuery(blogIndexQueryOptions());
  const content = useQuery(blogPostQueryOptions(slug));
  const post = index.data?.find((candidate) => candidate.slug === slug) ?? null;

  return (
    <main className="relative mx-auto mb-16 w-[min(50rem,calc(100%-5rem))] leading-[1.6]">
      <BackLink />

      <article>
        {post && (
          <header className="mb-10">
            <h1 className="mb-[0.35rem] text-[1.75rem] leading-[1.25] font-bold">{post.title}</h1>
            <time className="text-sm text-muted" dateTime={post.date}>
              {post.date}
            </time>
          </header>
        )}

        {(index.isPending || content.isPending) && <p className="text-muted">Loading…</p>}
        {(index.isError || content.isError || (index.isSuccess && !post)) && (
          <p className="text-muted">This piece could not be loaded.</p>
        )}
        {post && content.isSuccess && (
          <div className={styles.content} dangerouslySetInnerHTML={{ __html: content.data }} />
        )}
      </article>
    </main>
  );
}
