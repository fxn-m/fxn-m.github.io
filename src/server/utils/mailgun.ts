export const sendMail = (name: string, email: string, message: string, cb: any) => {
    const nodemailer = require("nodemailer")
    const mailGun = require("nodemailer-mailgun-transport")
    const auth = {
        auth: {
            api_key: process.env.MAILGUN_API_KEY,
            domain: process.env.MAILGUN_DOMAIN
        }
    }

    const transporter = nodemailer.createTransport(mailGun(auth))

    const mailOptions = {
        sender: name,
        from: email,
        to: "fnewportmangell@gmail.com",
        text: `${name} \n(${email})\n\nsays: \n${message}`,
        subject: "New Message from Contact Form"
    }

    console.log(JSON.stringify(mailOptions))

    transporter.sendMail(mailOptions, function (err: Error, data: any) {
        if (err) {
            cb(err, null)
        } else {
            cb(null, data)
        }
    })
}
