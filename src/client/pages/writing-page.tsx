import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { getSlugMap } from "@/server/utils/blog-utils"
import type { BlogPost } from "@/shared"

export default function WritingPage() {
  const [allBlogs, setAllBlogs] = useState<BlogPost[]>([])

  const blogsQuery = useQuery({
    enabled: import.meta.env.DEV,
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/blog?development=true`)
      const blogs = (await response.json()) as BlogPost[]
      return blogs.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    },
    queryKey: ["blogs"]
  })

  useEffect(() => {
    const syncBlogState = async (blogs: BlogPost[]) => {
      setAllBlogs(blogs)
      const slugMap = await getSlugMap(blogs)
      window.localStorage.setItem("slugMap", JSON.stringify(slugMap))
    }

    if (import.meta.env.DEV) {
      if (blogsQuery.data) {
        void syncBlogState(blogsQuery.data)
      }
      return
    }

    const loadBlogs = async () => {
      try {
        const response = await fetch("/html/index.json")
        const blogs = ((await response.json()) as BlogPost[]).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        await syncBlogState(blogs)
      } catch (error) {
        console.error("Error fetching blogs:", error)
      }
    }

    void loadBlogs()
  }, [blogsQuery.data])

  return (
    <div className="mt-4 flex flex-col">
      <ul className="space-y-2">
        {allBlogs.map((blog) => (
          <li className="flex items-center" key={blog.id}>
            <Link to={`/writing/${blog.slug}`}>{blog.title}</Link>
            <span
              aria-hidden="true"
              className="mx-3 flex-grow border-b border-dotted border-[rgba(134,134,134,0.4)]"
            />
            <span className="text-md text-right text-muted-foreground">{blog.date}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
