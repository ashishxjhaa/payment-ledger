import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html: string,
): Promise<void> => {
  try {
    const info = await transporter.sendMail({
      from: `"Payment Ledger" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("message send: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.log("Error sending email:", error);
  }
};

async function sendRegistrationEmail(userEmail: string, name: string) {
  const subject = "welcome to Payment Ledger!";
  const text = `Hello ${name},\n\nThank you for registering at Payment Ledger.
  We're exicted to have you on board!\n\nBest regards,\nThe Payment Ledger Team`;
  const html = `
    <h2>Welcome to Payment Ledger!</h2>

    <p>Hello ${name},</p>

    <p>Thank you for registering at <strong>Payment Ledger</strong>.</p>

    <p>We're excited to have you on board!</p>

    <p>Best regards,<br>The Payment Ledger Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

export default sendRegistrationEmail;
