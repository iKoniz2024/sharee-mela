"use client";

import Link from 'next/link';

import { Phone, MapPin, Mail } from "lucide-react";
import useSettings from "@/hooks/useSettings";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";

const QUICK_LINKS = [
  { label: "Home", to: "/" },
  { label: "All Products", to: "/products" },
  { label: "About Us", to: "/about" },
  { label: "Contact Us", to: "/contact" },
];

const SERVICES_LINKS = [
  { label: "Refund and Returns Policy", to: "/return-policy" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Delivery Rules", to: "/delivery-rules" },
];

export default function Footer() {
  const {
    siteName,
    logo,
    contactEmail,
    contactPhone,
    address,
    facebookUrl,
    instagramUrl,
    tiktokUrl,
    youtubeUrl,
  } = useSettings();

  const socialLinks = [
    { icon: FaFacebookF, href: facebookUrl, label: "Facebook" },
    { icon: FaInstagram, href: instagramUrl, label: "Instagram" },
    { icon: FaTiktok, href: tiktokUrl, label: "TikTok" },
    { icon: FaYoutube, href: youtubeUrl, label: "YouTube" },
  ];

  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <img src={logo} alt={siteName} className="h-20 sm:h-36 w-auto dark:invert" />
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {siteName} — your premier destination for exquisite traditional, Jamdani, Katan, Silk & designer sarees.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.to}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services & Help */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">
              Services & Help
            </h3>
            <ul className="space-y-2.5">
              {SERVICES_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.to}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Icons & Contact Info Column */}
          <div className="space-y-4 pt-1">
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                const href = social.href || "#";
                return (
                  <a
                    key={social.label}
                    href={href}
                    target={social.href ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/40 hover:text-foreground"
                  >
                    <Icon size={14} />
                  </a>
                );
              })}
            </div>
            <div className="space-y-2.5 text-sm text-muted-foreground">
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 hover:text-foreground">
                  <Mail className="size-4 shrink-0" />
                  {contactEmail}
                </a>
              )}
              {contactPhone && (
                <a href={`tel:${contactPhone}`} className="flex items-center gap-2 hover:text-foreground">
                  <Phone className="size-4 shrink-0" />
                  {contactPhone}
                </a>
              )}
              {address && (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  <span>{address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
