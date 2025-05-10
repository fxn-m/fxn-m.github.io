import type { Request, Response } from "express"
import { enrichReadingListItem } from "../services/notionService"

export const notionWebhookController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { body } = req
  console.log("Webhook received:", body)
  await enrichReadingListItem(
    body.entity.id,
    body.data.parent.id
  )
  res.status(200).json({ message: "Webhook received" })
}
