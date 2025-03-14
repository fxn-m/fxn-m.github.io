import { Client } from "@notionhq/client"
import dotenv from "dotenv"
dotenv.config()

export const getReadingList = async () => {
    console.log("Getting reading list...")

    const NOTIONAPIKEY = process.env.NOTIONAPIKEY
    const NOTIONDATABASEID = process.env.NOTIONDATABASEID ?? ""

    const notion = new Client({
        auth: NOTIONAPIKEY
    })

    let readingList: any[] = []
    let hasNextPage = true
    let startCursor = undefined

    while (hasNextPage) {
        const response: any = await notion.databases.query({
            database_id: NOTIONDATABASEID,
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
