import mailGun, {
  type Options
} from "nodemailer-mailgun-transport"
import nodemailer from "nodemailer"
import env from "../config/env"

interface MailCallback {
  (_error: Error | null): void
}

export const sendMail = (
  name: string,
  email: string,
  message: string,
  cb: MailCallback
): void => {
  const auth = {
    auth: {
      api_key: env.mailgunApiKey,
      domain: env.mailgunDomain
    }
  } as Options

  const transporter = nodemailer.createTransport(
    mailGun(auth)
  )

  const mailOptions = {
    sender: name,
    from: email,
    to: "fnewportmangell@gmail.com",
    text: `${name} \n(${email})\n\nsays: \n${message}`,
    subject: "New Message from Contact Form"
  }

  transporter.sendMail(mailOptions, (err: Error | null) => {
    if (err) {
      cb(err)
    } else {
      cb(null)
    }
  })
}
