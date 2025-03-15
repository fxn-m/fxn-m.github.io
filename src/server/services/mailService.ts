import mailGun, { type Options } from "nodemailer-mailgun-transport"
import nodemailer from "nodemailer"
import env from "../config/env"

interface MailCallback {
    (error: Error | null, data: any): void
}

export const sendMail = (name: string, email: string, message: string, cb: MailCallback): void => {
    const auth = {
        auth: {
            api_key: env.mailgunApiKey,
            domain: env.mailgunDomain
        }
    } as Options

    const transporter = nodemailer.createTransport(mailGun(auth))

    const mailOptions = {
        sender: name,
        from: email,
        to: "fnewportmangell@gmail.com",
        text: `${name} \n(${email})\n\nsays: \n${message}`,
        subject: "New Message from Contact Form"
    }

    transporter.sendMail(mailOptions, (err: Error | null, data: any) => {
        if (err) {
            cb(err, null)
        } else {
            cb(null, data)
        }
    })
}
