import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendContactEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const recipient = process.env.CONTACT_EMAIL || "host@cortexsim.io";

  // If no Resend API key, log to console (for development) and return success
  if (!resend) {
    console.log("[Contact Form - No Resend Key]");
    console.log(`From: ${name} <${email}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    console.log(`To: ${recipient}`);
    return { id: "dev-mode-no-email-sent" };
  }

  const { data, error } = await resend.emails.send({
    from: "CortexSim <onboarding@resend.dev>",
    to: [recipient],
    replyTo: email,
    subject: `Contact Form: ${subject}`,
    html: `
      <div style="background:#0A0A0F;color:#E0E0E0;font-family:Inter,sans-serif;padding:40px;max-width:600px;margin:0 auto;border:1px solid #00F0FF;border-radius:12px;">
        <h1 style="font-family:Orbitron,sans-serif;color:#00F0FF;text-transform:uppercase;">New Contact Message</h1>
        <div style="margin:24px 0;padding:20px;background:#1A1A2E;border-radius:8px;">
          <p style="margin:8px 0;"><strong style="color:#00F0FF;">From:</strong> ${name} (${email})</p>
          <p style="margin:8px 0;"><strong style="color:#00F0FF;">Subject:</strong> ${subject}</p>
          <p style="margin:8px 0;"><strong style="color:#00F0FF;">Message:</strong></p>
          <p style="white-space:pre-wrap;line-height:1.6;">${message}</p>
        </div>
        <div style="text-align:center;margin-top:32px;">
          <a href="mailto:${email}" style="display:inline-block;padding:12px 24px;background:#00F0FF;color:#0A0A0F;text-decoration:none;font-family:Orbitron,sans-serif;text-transform:uppercase;border-radius:8px;font-weight:bold;">Reply</a>
        </div>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}

export async function sendNewsletterEmail(email: string) {
  if (!resend) {
    console.log(`[Newsletter - No Resend Key] Subscribed: ${email}`);
    return { id: "dev-mode-no-email-sent" };
  }

  const { data, error } = await resend.emails.send({
    from: "CortexSim <onboarding@resend.dev>",
    to: [email],
    subject: "Welcome to CortexSim Newsletter",
    html: `
      <div style="background:#0A0A0F;color:#E0E0E0;font-family:Inter,sans-serif;padding:40px;max-width:600px;margin:0 auto;border:1px solid #00F0FF;border-radius:12px;">
        <h1 style="font-family:Orbitron,sans-serif;color:#00F0FF;text-transform:uppercase;">Welcome to the Neural Network</h1>
        <p style="line-height:1.6;margin:24px 0;">Thank you for subscribing to CortexSim updates. You'll receive the latest news on spiking neural networks, simulation features, and neuroscience research.</p>
        <div style="text-align:center;margin-top:32px;">
          <a href="https://cortexsim.vercel.app" style="display:inline-block;padding:12px 24px;background:#00F0FF;color:#0A0A0F;text-decoration:none;font-family:Orbitron,sans-serif;text-transform:uppercase;border-radius:8px;font-weight:bold;">Visit CortexSim</a>
        </div>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send newsletter: ${error.message}`);
  }

  return data;
}