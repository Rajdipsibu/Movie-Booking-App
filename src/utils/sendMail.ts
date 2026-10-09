import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "drajdip321@gmail.com",
    pass: process.env.EMAIL_PASS || "isfttxkjxaytjwwj",
  },
});

export const sendLoginMail = async (
  email: string,
  subject: string,
  html: string
) => {
  try {
    const info = await transporter.sendMail({
      from: `"Movie Booking" <${process.env.EMAIL_USER || "drajdip321@gmail.com"}>`,
      to: email,
      subject: subject,
      html: html,
    });
    console.log("Email sent successfully:", info.messageId);
    return { success: true, info };
  } catch (error) {
    console.error("Nodemailer Error: Failed to send email:", error);
    return { success: false, error };
  }
};
