import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

// console.log(process.env.EMAIL,process.env.EMAIL_PASS)

// configure SMTP transporter
 const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
})

// function to send email 
async function sendEmail(to,subject,text,html){
    try {
    const info = await transporter.sendMail({
        from: process.env.EMAIL,
        to,
        subject,
        text,
        html 
    })
    return {success:true,messageId:info.messageId}
    } catch (error) {
        console.error('Error sending email:', error);
        return {success:false,error:error.message}
    }
}




export {sendEmail}