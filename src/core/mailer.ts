import { render } from "mjml-react";
import nodemailer from "nodemailer";
import { ReactElement } from "react";

export const EMAIL_SUBJECTS = {
  LOGIN: "Your Photoshot Login Link",
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 534,
  secure: false,
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD
  },
});

// const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);

export const sendEmail = async ({
  to,
  subject,
  component,
}: {
  to: string;
  subject: string;
  component: ReactElement;
}) => {
  const { html } = render(component);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};
