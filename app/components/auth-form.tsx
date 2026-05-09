"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { HCaptchaWidget } from "@/app/components/hcaptcha-widget";

type Mode = "login" | "signup";

async function verifyCaptcha(token: string) {
  const response = await fetch("/api/auth/verify-captcha", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const payload = (await response.json()) as { ok?: boolean; error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Captcha verification failed.");
  }
}

export function AuthForm(props: { redirectTo?: string }) {
  const router = useRouter();
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? "";
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [signedInEmail, setSignedInEmail] = useState<string>("");

  useEffect(() => {
    const update = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setSignedInEmail(user?.email ?? "");
    };

    void update();
    const { data } = supabase.auth.onAuthStateChange(() => void update());
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (signedInEmail && props.redirectTo) {
      router.replace(props.redirectTo);
    }
  }, [props.redirectTo, router, signedInEmail]);

  const submit = async () => {
    setError("");
    if (!siteKey) {
      setError("Captcha is not configured (missing site key).");
      return;
    }
    if (!captchaToken) {
      setError("Please complete the captcha first.");
      return;
    }
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Name is required for signup.");
      return;
    }

    setBusy(true);
    try {
      await verifyCaptcha(captchaToken);

      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim() },
            captchaToken,
          },
        });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: { captchaToken },
        });
        if (signInError) throw signInError;
      }

      setPassword("");
      setCaptchaToken("");
      setCaptchaReset((v) => v + 1);
      if (props.redirectTo) router.replace(props.redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auth failed.");
      setCaptchaToken("");
      setCaptchaReset((v) => v + 1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full rounded-[28px] border border-[#efd7c3] bg-white/85 p-6 shadow-[0_30px_80px_rgba(99,25,18,0.10)] backdrop-blur">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-stone-500">Pancasila Hub</div>
          <div className="text-2xl font-semibold text-stone-900">
            {mode === "signup" ? "Daftar" : "Masuk"}
          </div>
        </div>
        <div className="inline-flex overflow-hidden rounded-full border border-stone-200 text-xs">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`px-3 py-1 ${
              mode === "login" ? "bg-stone-900 text-white" : "bg-transparent text-stone-600"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`px-3 py-1 ${
              mode === "signup" ? "bg-stone-900 text-white" : "bg-transparent text-stone-600"
            }`}
          >
            Daftar
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {mode === "signup" ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama"
            className="w-full rounded-full border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#b71c1c]"
          />
        ) : null}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          className="w-full rounded-full border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#b71c1c]"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="w-full rounded-full border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#b71c1c]"
        />

        {siteKey ? (
          <HCaptchaWidget
            siteKey={siteKey}
            resetKey={captchaReset}
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken("")}
            onError={() => setError("Captcha failed to load.")}
            className="rounded-[22px] border border-stone-200 bg-[#fff8f1] p-3"
          />
        ) : (
          <div className="text-sm text-stone-600">
            Captcha is not configured. Set <code>NEXT_PUBLIC_HCAPTCHA_SITE_KEY</code> and{" "}
            <code>HCAPTCHA_SECRET_KEY</code>.
          </div>
        )}

        {error ? <div className="text-sm text-red-700">{error}</div> : null}

        <button
          type="button"
          disabled={busy}
          onClick={() => void submit()}
          className="w-full rounded-full bg-[#b71c1c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8f1313] disabled:opacity-60"
        >
          {mode === "signup" ? "Daftar" : "Masuk"}
        </button>
      </div>
    </div>
  );
}
