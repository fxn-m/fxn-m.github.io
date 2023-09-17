import axios from "axios";

export const getBlogPosts = async () => {
  const k = import.meta.env.VITE_STRAPI_API_KEY;
  console.log(k);

  const posts = await axios.get(
    "https://fxnm-strapi-blog-9e2c8c1b9091.herokuapp.com/api/articles",
    {
      headers: {
        Authorization: `Bearer ${k}`,
      },
    }
  );
  const postsData = await posts.data.data;

  return postsData;
};
