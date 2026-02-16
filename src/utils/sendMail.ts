import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  secure: true,
  host:'smtp.gmail.com',
  port:465,
  auth: {
    user: "drajdip321@gmail.com",   // your gmail
    pass: "ptxauhfhoovcxbrb"
    // ptxa uhfh oovc xbrb    // app password
  }
});

export const sendLoginMail = (
  email: string,
  subject:string,
  html:string
) => {
  transporter.sendMail({
    to: email,
    subject: subject,
    html:html
  });
  console.log("Email send");
  
};
