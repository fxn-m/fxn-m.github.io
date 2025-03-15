import type { Request, Response } from "express"
import { sendMail } from "../services/mailService"

export const sendEmailController = (req: Request, res: Response): void => {
  const { name, email, message } = req.body

  sendMail(name, email, message, function (err: Error | null, data: any) {
    if (err) {
      console.log(err)
      res.status(500).json({ message: "Internal Error" })
    } else {
      res.status(200).json({ message: "Email sent!!!" })
    }
  })
}
