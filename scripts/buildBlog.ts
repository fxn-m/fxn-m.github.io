/**
 * Fetches the latest blog posts from the Notion database and generates static HTML files for each post.
 * The generated files are saved in public/html directory.
 */

import fs from "fs"
import path from "path"

import { fileURLToPath } from "node:url"
import { dirname } from "node:path"

import dotenv from "dotenv"
import { convertMarkdownToHTML } from "@/server/utils/blogUtils"
import type { BlogPost } from "@/shared"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const outputDir = path.join(__dirname, "../public/html")

if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true })
}

fs.mkdirSync(outputDir, { recursive: true })

// process and update all blog posts in the Notion database
const processBlogPosts = async () => {
  await fetch(`${process.env.BACKEND_URL}/readingList/enrich`, {
    method: "POST"
  })
}

// fetch the blog posts from the Notion database
const fetchBlogPosts = async () => {
  const blogs = await fetch(`${process.env.BACKEND_URL}/blog`)
  return blogs.json()
}

// fetch the blog post by id
const fetchBlogPostById = async (id: string) => {
  const blogPost = await fetch(`${process.env.BACKEND_URL}/blog/${id}`)
  return blogPost.json()
}

const run = async () => {
  console.log("Building blog posts...")
  console.log("Backend URL:", process.env.BACKEND_URL)
  await processBlogPosts()
  const blogs = await fetchBlogPosts()
  const indexPromises = blogs.map(async (blog: BlogPost) => {
    const { id, title, date, slug } = blog
    const markdown = await fetchBlogPostById(id)
    const { content } = convertMarkdownToHTML(markdown)

    // save the HTML file in public/html directory
    const filePath = path.join(outputDir, `${slug}.html`)
    fs.writeFileSync(filePath, content)

    return { id, title, date, slug }
  })

  const index = await Promise.all(indexPromises)

  // update the index.json file with the latest blog posts
  const indexPath = path.join(outputDir, "index.json")
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2))
}

run()
