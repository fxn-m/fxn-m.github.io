import type { Request, Response } from "express"
import { readReadingListFromFile } from "../utils/fileUtils"
import env from "../config/env"

export const getReadingListController = (_: Request, res: Response): void => {
  try {
    const readingList = readReadingListFromFile()
    res.status(200).json(readingList)
  } catch (error) {
    console.error("Error fetching reading list:", error)
    res.status(500).json({ message: "Failed to fetch reading list" })
  }
}

export const markReadController = (req: Request, res: Response): void => {
  const secret = req.body.secret
  const id = req.params.id

  if (secret !== env.readmeSecret) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  res.status(200).json({ message: id + " marked as read" })
}
