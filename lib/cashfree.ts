// lib/cashfree.ts
declare global {
  interface Window {
    Cashfree?: (config: { mode: "sandbox" | "production" }) => any;
  }
}

export const loadCashfreeSDK = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return;

    const envMode =
      process.env.NEXT_PUBLIC_CASHFREE_ENV === "production"
        ? "production"
        : "sandbox"; // Defaults to sandbox for test/dev

    if (window.Cashfree) {
      resolve(window.Cashfree({ mode: envMode }));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => {
      if (window.Cashfree) {
        resolve(window.Cashfree({ mode: envMode }));
      } else {
        reject(new Error("Cashfree SDK failed to initialize."));
      }
    };
    script.onerror = () => reject(new Error("Failed to load Cashfree script."));
    document.body.appendChild(script);
  });
};