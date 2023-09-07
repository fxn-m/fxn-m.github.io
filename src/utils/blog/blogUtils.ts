import showdown from "showdown";
import { type Metadata } from "showdown";

export const getBlogPaths = (): string[] => {
  const blogs = import.meta.glob("../../content/blog/*.md", {
    as: "raw",
    eager: true,
  });
  const paths = Object.keys(blogs).map((path) => `/src/${path.slice(6)}`);
  return paths;
};

export const sortPostsByDate = (metadataArray: any[]) => {
  const sortedPosts = metadataArray.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });
  return sortedPosts.reverse();
};

export const getBlogPostData = async (blogPaths: string[]) => {
  const contentMetadataTable: { [key: string]: string } = {};
  const contentArray: string[] = [];
  const metadataArray: any[] = [];
  const conv = new showdown.Converter({ metadata: true });

  // Use Promise.all to wait for all fetch operations to complete
  await Promise.all(
    blogPaths.map(async (path) => {
      const blogPostData = await fetch(path);
      const blogPost = await blogPostData.text();
      const html = conv.makeHtml(blogPost);
      const metadata = conv.getMetadata() as Metadata; // returns an object with the document metadata
      console.log(metadata.date);
      contentMetadataTable[metadata.title] = html;
      contentArray.push(html);
      metadataArray.push(metadata);
    })
  );

  // ... previous code ...

  const sortedMetadata = sortPostsByDate(metadataArray);
  const sortedContentArray = sortedMetadata.map(
    (meta) => contentMetadataTable[meta.title]
  );

  return { contentArray: sortedContentArray, metadataArray: sortedMetadata };
};
