import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODMAILER_USER,
        pass: process.env.NODMAILER_PASS
    }
})

const sendEmail = (send_from,sent_to,htmlTemplate, subject,) => {
    const mailOptions = {
        from: send_from,
        to: sent_to,
        subject,
        html:htmlTemplate,
        
    }
    // console.log("mailOptions>>",mailOptions);

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err)
        } else {
            console.log(info)
        }
    })
}

export default sendEmail