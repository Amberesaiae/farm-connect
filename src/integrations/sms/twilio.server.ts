/**
 * Twilio SMS dispatch (server-only). Routes through the Lovable connector
 * gateway so the Twilio API Key never leaves the server.
 *
 * If the Twilio connector isn't wired (no TWILIO_API_KEY env var), we log
 * the code to the server console — useful for local development without
 * silently leaking codes to the browser.
 */

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

interface DispatchOpts {
  to: string;
  code: string;
}

export async function dispatchOtpSms({ to, code }: DispatchOpts): Promise<void> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const twilioKey = process.env.TWILIO_API_KEY;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!lovableKey || !twilioKey || !fromNumber) {
    // Provider not configured — surface the code in server logs so devs
    // can complete the flow. Never returned to the client.
    console.warn(
      `[otp] SMS provider not configured. code=${code} to=${to}. ` +
        `Connect Twilio + set TWILIO_FROM_NUMBER to enable real delivery.`,
    );
    return;
  }

  const body = new URLSearchParams({
    To: to,
    From: fromNumber,
    Body: `Your verification code is ${code}. It expires in 15 minutes.`,
  });

  try {
    const res = await fetch(`${GATEWAY_URL}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": twilioKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[otp] Twilio dispatch failed ${res.status}: ${text}`);
    }
  } catch (e) {
    console.error("[otp] Twilio dispatch threw:", e);
  }
}