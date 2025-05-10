export type BlogPost = {
  id: string
  title: string
  date: string
  slug: string
}

export type BlogMetadata = {
  title: string
  date: string
}

export type SlugMap = Record<string, string>
