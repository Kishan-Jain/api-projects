import nodemailer from "nodemailer"
import ApiError from "./ApiError.js"

const sendEmail = async(
  emailAddress, subject, message 
) => {

  const auth = nodemailer.createTransport({
    service : "gmail",
    port : "465",
    secure : true,
    auth : {
      user : process.env.ADMIN_EMAIL_ADDRESS,
      pass : process.env.ADMIN_EMAIL_HASH_PASSWORD
    }
  })

  const sendMessage = {
    from : process.env.ADMIN_EMAIL_ADDRESS,
    to : emailAddress,
    subject : subject,
    text : message
  }

  auth.sendMail(sendMessage, (error, mailResponce) => {
    if(error) {
      throw new ApiError(500, `EmailError : ${error || "Email send error"}`)
    }
    return mailResponce
  })
}

export default sendEmail