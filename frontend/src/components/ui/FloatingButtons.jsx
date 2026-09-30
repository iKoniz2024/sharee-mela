"use client";

import { useState, useEffect } from "react";
import { FaWhatsapp, FaArrowUp } from "react-icons/fa";
import { ShoppingCart } from "lucide-react";
import useCart from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import useSettings from "@/hooks/useSettings";

export default function FloatingButtons() {
  const [mounted, setMounted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { cartCount } = useCart();
  const { user } = useAuth();
  const { contactPhone } = useSettings();
  const isAdmin = user?.role === "admin";

  const rawNumber = contactPhone ? contactPhone.replace(/[^0-9]/g, "") : "01886123703";
  const whatsappNumber = rawNumber.startsWith("88")
    ? rawNumber
    : rawNumber.startsWith("0")
      ? `88${rawNumber}`
      : rawNumber;
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCartDrawer = () => {
    window.dispatchEvent(new Event("open-cart-drawer"));
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-20 right-3 z-90 flex flex-col gap-3 items-center lg:bottom-8 lg:right-8 sm:gap-4">
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-110 sm:h-14 sm:w-14 cursor-pointer"
          aria-label="Scroll to top"
        >
          <FaArrowUp className="text-lg sm:text-2xl" />
        </button>
      )}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-110 sm:h-14 sm:w-14"
        aria-label="Contact us on WhatsApp"
      >
        <FaWhatsapp className="text-lg sm:text-2xl" />
      </a>

      {!isAdmin && (
        <button
          type="button"
          onClick={openCartDrawer}
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-2xl transition hover:bg-primary hover:text-white sm:h-14 sm:w-14 cursor-pointer"
          aria-label="Open cart drawer"
        >
          <div className="relative">
            <ShoppingCart className="size-4 sm:size-5" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </div>
        </button>
      )}
    </div>
  );
}
