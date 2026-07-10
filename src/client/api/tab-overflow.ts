import { queryOptions } from "@tanstack/react-query"

export type TabOverflowItem = {
  id: string
  properties: {
    Added?: { date?: { start?: string | null } | null; type: "date" }
    Categories?: { multi_select: { name: string }[] }
    Name?: { title: { plain_text: string }[] }
    "Read Time"?: { number: number }
    Summary?: { rich_text: { plain_text: string }[] }
    URL?: { url: string }
  }
}

const TAB_OVERFLOW_STALE_TIME = 1000 * 60 * 5

const fetchTabOverflow = async (): Promise<TabOverflowItem[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/tab-overflow`
  )

  if (!response.ok) {
    throw new Error("Network response was not ok")
  }

  return response.json() as Promise<TabOverflowItem[]>
}

export const tabOverflowQueryOptions = () =>
  queryOptions({
    queryFn: fetchTabOverflow,
    queryKey: ["tab-overflow"],
    staleTime: TAB_OVERFLOW_STALE_TIME
  })
