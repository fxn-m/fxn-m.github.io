import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import fs from "fs"
import { getReadingList } from "../services/notionService"
import path from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const getReadingListFilePath = (): string => {
  return path.join(dirname(__dirname), "readingList.json")
}

export const writeReadingListToFile = async (): Promise<void> => {
  const readingList = await getReadingList()
  const filePath = getReadingListFilePath()
  fs.writeFileSync(filePath, JSON.stringify(readingList, null, 2))
}

export const readReadingListFromFile = () => {
  const filePath = getReadingListFilePath()
  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

export const ensureReadingListFileExists = async (): Promise<void> => {
  const filePath = getReadingListFilePath()
  if (!fs.existsSync(filePath)) {
    await writeReadingListToFile()
  }
}
