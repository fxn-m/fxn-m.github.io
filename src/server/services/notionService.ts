import { Client } from "@notionhq/client"
import env from "../config/env"

export const getReadingList = async (): Promise<any[]> => {
    const notion = new Client({
        auth: env.notionApiKey
    })

    let readingList: any[] = []
    let hasNextPage = true
    let startCursor = undefined

    while (hasNextPage) {
        const response: any = await notion.databases.query({
            database_id: env.notionDatabaseId,
            filter: {
                or: [
                    {
                        property: "Type",
                        select: {
                            equals: "Essay"
                        }
                    },
                    {
                        property: "Type",
                        select: {
                            equals: "Article"
                        }
                    },
                    {
                        property: "Type",
                        select: {
                            equals: "Paper"
                        }
                    },
                    {
                        property: "Type",
                        select: {
                            equals: "Blog Post"
                        }
                    },
                    {
                        property: "Type",
                        select: {
                            equals: "Report"
                        }
                    },
                    {
                        property: "Status",
                        select: {
                            equals: "Shelved"
                        }
                    }
                ]
            },
            start_cursor: startCursor
        })

        readingList = [...readingList, ...response.results]
        startCursor = response.next_cursor
        hasNextPage = response.has_more
    }

    return readingList
}
