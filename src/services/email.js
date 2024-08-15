import nodemailer from "nodemailer";

export const sendEmail = async (email, subject, html, attachments = []) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"E-commerce 🛒" <${process.env.NODEMAILER_USER}>`,
    to: email,
    subject: subject,
    html: html,
    attachments
  });

  if (info.accepted.length) return true;
  return false;
};
