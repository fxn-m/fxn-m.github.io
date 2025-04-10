import type { Request, Response } from "express"

export const notionWebhookController = (req: Request, res: Response): void => {
  const { body } = req
  console.log("Webhook received:", body)
  res.status(200).json({ message: "Webhook received" })
}
