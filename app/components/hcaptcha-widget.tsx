"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    hcaptcha?: {
      render: (
        container: HTMLElement,
        params: Record<string, unknown>,
      ) => number;
      reset: (widgetId?: number) => void;
      remove: (widgetId: number) => void;
    };
    __hcaptchaOnLoad?: () => void;
  }
}

let hcaptchaLoader: Promise<void> | null = null;

function loadHCaptchaScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.hcaptcha) return Promise.resolve();
  if (hcaptchaLoader) return hcaptchaLoader;

  hcaptchaLoader = new Promise<void>((resolve, reject) => {
    window.__hcaptchaOnLoad = () => resolve();

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src^="https://js.hcaptcha.com/1/api.js"]',
    );
    if (existing) {
      // If another widget injected the script without an onload callback, fall back to load event.
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load hCaptcha script.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://js.hcaptcha.com/1/api.js?render=explicit&onload=__hcaptchaOnLoad";
    script.async = true;
    script.defer = true;
    // Prefer the `onload` query callback. Keep this as an extra fallback.
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load hCaptcha script."));
    document.head.appendChild(script);
  });

  return hcaptchaLoader;
}

export function HCaptchaWidget(props: {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  resetKey?: number;
  className?: string;
}) {
  const { siteKey, onVerify, onExpire, onError, resetKey, className } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const reactId = useId();
  const containerId = useMemo(
    () => `hcaptcha-${reactId.replace(/:/g, "")}`,
    [reactId],
  );

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        await loadHCaptchaScript();
        if (cancelled) return;

        const container = containerRef.current;
        if (!container || !window.hcaptcha) return;

        // Avoid double-render in strict mode.
        if (widgetIdRef.current !== null) return;

        widgetIdRef.current = window.hcaptcha.render(container, {
          sitekey: siteKey,
          callback: (token: string) => onVerify(token),
          "expired-callback": () => onExpire?.(),
          "error-callback": () => onError?.(),
        });
        setReady(true);
      } catch {
        onError?.();
      }
    };

    void init();

    return () => {
      cancelled = true;
      const widgetId = widgetIdRef.current;
      if (widgetId !== null && window.hcaptcha?.remove) {
        window.hcaptcha.remove(widgetId);
      }
      widgetIdRef.current = null;
    };
  }, [siteKey, onError, onExpire, onVerify]);

  useEffect(() => {
    const widgetId = widgetIdRef.current;
    if (widgetId === null) return;
    if (!window.hcaptcha?.reset) return;
    if (!resetKey) return;
    window.hcaptcha.reset(widgetId);
  }, [resetKey]);

  return (
    <div className={className}>
      <div id={containerId} ref={containerRef} />
      {!ready ? (
        <div className="mt-2 text-xs text-stone-500">Loading captcha...</div>
      ) : null}
    </div>
  );
}
