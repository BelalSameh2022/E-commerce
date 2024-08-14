import nodemailer from "nodemailer";

export const sendEmail = async (email, subject, html, attachments = []) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "belal.ko3ip@gmail.com",
      pass: process.env.NODEMAILER_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: '"E-commerce 😪" <belal.ko3ip@gmail.com>',
    to: email,
    subject: subject,
    html: html,
    attachments
  });

  if (info.accepted.length) return true;
  return false;
};
