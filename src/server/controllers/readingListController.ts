import type { Request, Response } from "express"
import { readReadingListFromFile } from "../utils/fileUtils"
import { enrichAllReadingListItems } from "../services/notionService"

export const getReadingListController = (
  _: Request,
  res: Response
): void => {
  try {
    const readingList = readReadingListFromFile()
    res.status(200).json(readingList)
  } catch (error) {
    console.error("Error fetching reading list:", error)
    res
      .status(500)
      .json({ message: "Failed to fetch reading list" })
  }
}

export const enrichReadingListController = async (
  _: Request,
  res: Response
): Promise<void> => {
  try {
    await enrichAllReadingListItems()
    res.status(200).json({
      message: "Reading list enriched successfully"
    })
  } catch (error) {
    console.error("Error enriching reading list:", error)
    res
      .status(500)
      .json({ message: "Failed to enrich reading list" })
  }
}
