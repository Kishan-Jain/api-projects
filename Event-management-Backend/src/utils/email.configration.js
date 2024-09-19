import nodemailer from "nodemailer"


// async..await is not allowed in global scope, must use a wrapper
function sendAMail(userEmail, mailSubject, mailDescription){
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: "465",
    secure: true, // true for port 465, false for other ports
    auth: {
      user: process.env.COMPANY_EMAIL_ADDRESS,
      pass: process.env.EMAIL_HASH_PASSWORD,
    },
  });
  
  // send mail with defined transport object
  transporter.sendMail({
    from: process.env.COMPANY_EMAIL_ADDRESS,
    to: userEmail,
    subject: mailSubject,
    text: mailDescription
  },(error) => {
    if(error) {
      throw new ApiError(500, `EmailError : ${error || "Email send error"}`)
    }
    return `Email send successfully : ${mailSubject}`
  });
}

export default sendAMail