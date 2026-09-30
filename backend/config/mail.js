const nodemailer = require("nodemailer");

const createTransporter = (forcePort) => {
  const host = process.env.SMTP_HOST;
  const port = forcePort !== undefined ? Number(forcePort) : (Number(process.env.SMTP_PORT) || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const isSecure = port === 465;

  // Custom Domain / cPanel or explicit host configuration
  if (host && !host.includes("gmail")) {
    return nodemailer.createTransport({
      host: host,
      port: port,
      secure: isSecure, // Port 465 requires secure: true (SSL)
      requireTLS: !isSecure, // Port 587 requires requireTLS: true (STARTTLS)
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 3500,
      greetingTimeout: 3500,
      socketTimeout: 5000,
    });
  }

  // Gmail configuration
  if (port === 465) {
    return nodemailer.createTransport({
      host: host || "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 3500,
      greetingTimeout: 3500,
      socketTimeout: 5000,
    });
  }

  // Default Gmail service preset or STARTTLS fallback
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
    connectionTimeout: 3500,
    greetingTimeout: 3500,
    socketTimeout: 5000,
  });
};

const sendMail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP_USER or SMTP_PASS missing in .env. Skipping email dispatch.");
    return null;
  }

  const primaryPort = Number(process.env.SMTP_PORT) || 465;
  const alternatePort = primaryPort === 465 ? 587 : 465;

  try {
    const transporter = createTransporter(primaryPort);
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log("Email sent successfully to:", to, "MessageId:", info?.messageId);
    return info;
  } catch (error) {
    console.error(`Failed to send email on primary port ${primaryPort} to:`, to, "Error:", error.message);

    // If initial attempt failed/timed out, retry on alternate port (465 <-> 587)
    if (
      error.code === "ETIMEDOUT" ||
      error.code === "ESOCKET" ||
      error.code === "ECONNREFUSED" ||
      (error.message && error.message.toLowerCase().includes("timeout"))
    ) {
      try {
        console.log(`Retrying email send using alternate SMTP port ${alternatePort}...`);
        const retryTransporter = createTransporter(alternatePort);
        const retryInfo = await retryTransporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to,
          subject,
          html,
        });
        console.log(`Email sent successfully on alternate port ${alternatePort} to:`, to, "MessageId:", retryInfo?.messageId);
        return retryInfo;
      } catch (retryErr) {
        console.error(`Alternate port ${alternatePort} email send also failed:`, retryErr.message);
      }
    }
    return null;
  }
};

module.exports = { sendMail };