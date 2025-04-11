import type { Request, Response } from "express"
import { readReadingListFromFile } from "../utils/fileUtils"

export const getReadingListController = (_: Request, res: Response): void => {
  try {
    const readingList = readReadingListFromFile()
    res.status(200).json(readingList)
  } catch (error) {
    console.error("Error fetching reading list:", error)
    res.status(500).json({ message: "Failed to fetch reading list" })
  }
}
