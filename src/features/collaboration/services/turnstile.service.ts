type TurnstileResult = {
  success: boolean;
  "error-codes"?: string[];
};

export async function validateTurnstileToken(token: string, remoteIp?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: remoteIp,
        idempotency_key: crypto.randomUUID(),
      }),
    });
    if (!response.ok) return false;

    const result = await response.json() as TurnstileResult;
    return result.success;
  } catch {
    return false;
  }
}
