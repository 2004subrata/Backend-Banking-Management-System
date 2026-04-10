require("dotenv").config();
const nodemailer = require("nodemailer");

/**
 * - Create a Nodemailer transporter.
 */
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

/**
 * - Verifies the email transporter connection configuration.
 * - Ensures that the SMTP settings are correct and the server is ready to accept messages.
 */
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

/**
 * - Sends an email using the configured transporter.
 * @param {string} to - Recipient email address
 * @param {string} subject - Subject of the email
 * @param {string} [text] - Plain text version of the email body
 * @param {string} [html] - HTML version of the email body
 */
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

/**
 * - Sends a registration confirmation email to a new user.
 * @param {string} userEmail - Recipient's email address
 * @param {string} name - Name of the user to personalize the email
 */
async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to Backend Ledger";
  const text = `Hello ${name},\n\nThank you for registering at Backend Ledger. We are excited to have you on board!\n\n Best regards,\nThe Backend Ledger team`;
  const html = `<p>Hello ${name},</p><p>Thank you for registering at Backend Ledger. We are excited to have you on board!</p><p> Best regards,<br>The Backend Ledger team</p>`;

  await sendEmail(userEmail, subject, text, html);
}

/**
 * - Sends a transaction notification email to the user.
 * @param {string} userEmail - Recipient's email address
 * @param {string} name - User's name for personalization
 * @param {number} amount - Transaction amount
 * @param {string} toAccount - Recipient account identifier (e.g., account number or name)
 */
async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Successful!";
  const text = `Hello ${name},\n\nYour transaction of $${amount} to account ${toAccount} was successful.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hello ${name},</p><p>Your transaction of $${amount} to account ${toAccount} was successful.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

  await sendEmail(userEmail, subject, text, html);
}

/**
 * - Sends a transaction failure notification email to the user.
 * @param {string} userEmail - Recipient's email address
 * @param {string} name - User's name for personalization
 * @param {number} amount - Transaction amount that failed
 * @param {string} toAccount - Intended recipient account identifier
 */
async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Failed";
  const text = `Hello ${name},\n\nWe regret to inform you that your transaction of $${amount} to account ${toAccount} has failed. Please try again later.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hello ${name},</p><p>We regret to inform you that your transaction of $${amount} to account ${toAccount} has failed. Please try again later.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

  await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail,
};
