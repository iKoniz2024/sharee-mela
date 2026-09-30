/**
 * Helper to safely track client-side Meta Pixel events (AddToCart, ViewContent, InitiateCheckout, Purchase, etc.)
 */
export const trackMetaPixelEvent = (eventName, data = {}) => {
  if (typeof window !== "undefined" && window.fbq) {
    try {
      const payload = { ...data };

      // Ensure currency is always a clean 3-letter uppercase ISO currency code
      if (payload.currency || eventName === "Purchase" || eventName === "AddToCart" || eventName === "InitiateCheckout") {
        payload.currency = String(payload.currency || "BDT").toUpperCase().trim();
      }

      // Ensure value is always a valid positive number
      if (payload.value !== undefined || eventName === "Purchase" || eventName === "AddToCart" || eventName === "InitiateCheckout") {
        const val = Number(payload.value);
        payload.value = !isNaN(val) && val > 0 ? Number(val.toFixed(2)) : 0.01;
      }

      window.fbq("track", eventName, payload);

      if (process.env.NODE_ENV !== "production") {
        console.log(`[Meta Pixel Client Event]: ${eventName}`, payload);
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[Meta Pixel Client Warning]:", err);
      }
    }
  } else if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    console.log(`[Meta Pixel Event Pending ID Setup]: ${eventName}`, data);
  }
};
