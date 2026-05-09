type VerifyResult =
  | { ok: true }
  | { ok: false; error: string; codes?: string[] };

export async function verifyHCaptcha(params: {
  token: string;
  remoteip?: string;
}): Promise<VerifyResult> {
  const secret = process.env.HCAPTCHA_SECRET_KEY;
  if (!secret) {
    return { ok: false, error: "HCAPTCHA_SECRET_KEY is not configured." };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", params.token);
  if (params.remoteip) body.set("remoteip", params.remoteip);

  const response = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    return { ok: false, error: `hCaptcha verify failed (${response.status}).` };
  }

  const json = (await response.json()) as {
    success?: boolean;
    "error-codes"?: string[];
  };

  if (json.success) return { ok: true };
  return {
    ok: false,
    error: "Captcha verification failed.",
    codes: json["error-codes"],
  };
}
