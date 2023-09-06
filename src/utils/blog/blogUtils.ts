import showdown from "showdown";
// import Metadata from showdown metadata extension
import { type Metadata } from "showdown";

export const getBlogPaths = (): string[] => {
  const blogs = import.meta.glob("../../content/blog/*.md", {
    as: "raw",
    eager: true,
  });
  const paths = Object.keys(blogs).map((path) => `/src/${path.slice(6)}`);
  return paths;
};

export const getBlogPostData = async (blogPaths: string[]) => {
  const contentArray: string[] = [];
  const metadataArray: any[] = [];
  const conv = new showdown.Converter({ metadata: true });

  // Use Promise.all to wait for all fetch operations to complete
  await Promise.all(
    blogPaths.map(async (path) => {
      const blogPostData = await fetch(path);
      const blogPost = await blogPostData.text();
      const html = conv.makeHtml(blogPost);
      const metadata: string | Metadata = conv.getMetadata(); // returns an object with the document metadata
      contentArray.push(html);
      metadataArray.push(metadata);
    })
  );

  return { contentArray, metadataArray };
};
