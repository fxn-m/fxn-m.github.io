import mailGun, { Options } from "nodemailer-mailgun-transport"
import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

export const sendMail = (name: string, email: string, message: string, cb: any) => {
    const auth = {
        auth: {
            api_key: process.env.MAILGUN_API_KEY,
            domain: process.env.MAILGUN_DOMAIN
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

    console.log(JSON.stringify(mailOptions))

    transporter.sendMail(mailOptions, (err: Error | null, data: any) => {
        if (err) {
            cb(err, null)
        } else {
            cb(null, data)
        }
    })
}
