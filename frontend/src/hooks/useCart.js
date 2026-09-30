"use client";

import { useContext } from "react";
import { CartContext } from "@/context/cartContextValue";

export default function useCart() {
  return useContext(CartContext);
}
