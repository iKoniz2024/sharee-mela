const CART_KEY = "infinity_store_cart";

export function getLocalCart() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cleaned = parsed
      .map((item) => ({
        ...item,
        productId: item.productId || item._id || item.id,
      }))
      .filter(
        (item) => item.productId && item.price !== undefined && item.price !== null
      );
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(CART_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function setLocalCart(items) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // Ignore quota errors
  }
}

export function addToLocalCart(item) {
  const cart = getLocalCart();
  const targetId = String(item.productId || item._id || item.id || "");
  const targetSize = String(item.size || "").trim();
  const targetColor = String(item.color || "").trim();

  const existing = cart.find(
    (c) =>
      String(c.productId || c._id || c.id || "") === targetId &&
      String(c.size || "").trim() === targetSize &&
      String(c.color || "").trim() === targetColor
  );
  if (existing) {
    existing.quantity += item.quantity;
    existing.title = item.title || existing.title;
    existing.thumbnail = item.thumbnail || existing.thumbnail;
    existing.colorImage = item.colorImage || existing.colorImage;
    existing.price = item.price || existing.price;
    existing.stock = item.stock ?? existing.stock;
    existing.category = item.category || existing.category;
  } else {
    cart.push({ ...item, quantity: item.quantity });
  }
  setLocalCart(cart);
  return cart;
}

export function updateLocalCartItem(productId, quantity, size = "", color = "") {
  let cart = getLocalCart();
  const targetId = String(productId || "");
  const targetSize = String(size || "").trim();
  const targetColor = String(color || "").trim();

  const isMatch = (c) =>
    String(c.productId || c._id || c.id || "") === targetId &&
    String(c.size || "").trim() === targetSize &&
    String(c.color || "").trim() === targetColor;

  if (quantity <= 0) {
    cart = cart.filter((c) => !isMatch(c));
  } else {
    cart = cart.map((c) => (isMatch(c) ? { ...c, quantity } : c));
  }
  setLocalCart(cart);
  return cart;
}

export function removeFromLocalCart(productId, size = "", color = "", index = -1) {
  let cart = getLocalCart();
  if (typeof index === "number" && index >= 0 && index < cart.length) {
    cart.splice(index, 1);
  } else {
    const targetId = String(productId || "");
    const targetSize = String(size || "").trim();
    const targetColor = String(color || "").trim();

    cart = cart.filter(
      (c) =>
        !(
          String(c.productId || c._id || c.id || "") === targetId &&
          String(c.size || "").trim() === targetSize &&
          String(c.color || "").trim() === targetColor
        )
    );
  }
  setLocalCart(cart);
  return cart;
}

export function getLocalCartCount() {
  return getLocalCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function clearLocalCart() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CART_KEY);
  } catch {
    // Ignore
  }
}
