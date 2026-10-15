// components/affiliate/TurnstileWidget.tsx
"use client";

import React from "react";
import { Turnstile } from "@marsidev/react-turnstile";

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export default function TurnstileWidget({
  onSuccess,
  onError,
  onExpire,
}: TurnstileWidgetProps) {
  const siteKey =
    process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || "";

  if (!siteKey) {
    return (
      <div className="p-2 text-xs text-red-500 bg-red-50 rounded-xl border border-red-200">
        Turnstile Sitekey is not configured in .env.local
      </div>
    );
  }

  return (
    <div className="flex justify-center my-3">
      <Turnstile
        siteKey={siteKey}
        onSuccess={onSuccess}
        onError={onError}
        onExpire={onExpire}
        options={{
          theme: "light",
          size: "normal",
        }}
      />
    </div>
  );
}