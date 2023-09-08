import showdown from "showdown";
import { type Metadata } from "showdown";
import { type Blog } from "@/types/Blog";

export const getBlogPaths = (): string[] => {
  const blogs = import.meta.glob("../../content/blog/*.md", {
    as: "raw",
    eager: true,
  });
  const paths = Object.keys(blogs).map((path) => `/src/${path.slice(6)}`);
  return paths;
};

export const getBlogPostData = async (blogPaths: string[]) => {
  const combinedDataArray: Blog[] = [];
  const conv = new showdown.Converter({ metadata: true });

  // Use Promise.all to wait for all fetch operations to complete
  await Promise.all(
    blogPaths.map(async (path) => {
      const blogPostData = await fetch(path);
      const blogPost = await blogPostData.text();
      const html = conv.makeHtml(blogPost);
      const metadata = conv.getMetadata() as Metadata; // returns an object with the document metadata
      combinedDataArray.push({
        content: html,
        metadata: metadata as Metadata,
        id: `/blog/${path.split("/").pop()!.slice(0, -3)}`,
      });
    })
  );

  const sortedCombinedArray = combinedDataArray.sort((a, b) => {
    const dateA = new Date(a.metadata.date);
    const dateB = new Date(b.metadata.date);
    return dateB.getTime() - dateA.getTime();
  });

  return sortedCombinedArray;
};
