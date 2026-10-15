// app/affiliate/layout.tsx
"use client";

import React from "react";
import { AffiliateAuthProvider } from "@/context/affiliate-auth-context";

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AffiliateAuthProvider>
      {children}
    </AffiliateAuthProvider>
  );
}