"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { CartContext } from "./cartContextValue";
import { getLocalCartCount } from "@/utils/localCart";

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(getLocalCartCount());
  }, []);

  const refetchCartCount = useCallback((count) => {
    setCartCount(count !== undefined ? count : getLocalCartCount());
  }, []);

  const value = useMemo(() => ({
    cartCount,
    refetchCartCount,
  }), [cartCount, refetchCartCount]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

