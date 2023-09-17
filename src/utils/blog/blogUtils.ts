import axios from "axios";

export const getBlogPosts = async () => {
  const k =
    "ebce4a1b10e1782909b0379022674f8b25c2d622c76087150bf5bdcbe9189d9bb3e97affaa8a0e2afc47555fd34a617b67fb8d935f4b79b02474b1c83c6e7a33a47a1e9524a6b73d9490fedb1649f1d0954d76f38632ecab15aedfce9da029178bf001ff87a2f5d53c240090cdf88544d7ef9ec89f0238aac08eeec0507fd6b5";
  const posts = await axios.get("http://localhost:1337/api/articles", {
    headers: {
      Authorization: `Bearer ${k}`,
    },
  });
  const postsData = await posts.data.data;

  return postsData;
};
