"use client";

import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";
import usePageTitle from "@/hooks/usePageTitle";
import Link from "next/link";
import {
  Shield,
  Lock,
  EyeOff,
  UserCheck,
  Cookie,
  Key,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

export default function Privacy({ children }) {
  const { siteName } = useSettings();
  usePageTitle("Privacy Policy");

  const highlights = [
    {
      icon: Lock,
      title: "Encrypted Data",
      description: "All sensitive customer data is stored securely with industry encryption.",
    },
    {
      icon: EyeOff,
      title: "No Data Selling",
      description: "We never sell or rent your personal information to third parties.",
    },
    {
      icon: UserCheck,
      title: "Full Control",
      description: "You have full control to request data updates or deletion anytime.",
    },
  ];

  const sections = [
    {
      icon: UserCheck,
      title: "1. Information We Collect",
      content:
        "We collect information you provide directly, such as your name, phone number, email address, shipping address, and order history when you place an order or contact support.",
    },
    {
      icon: Shield,
      title: "2. How We Use Your Data",
      content:
        "Your data is strictly used to fulfill orders, process payments, send delivery SMS updates, enhance customer support, and inform you about exclusive offers.",
    },
    {
      icon: EyeOff,
      title: "3. Information Sharing",
      content:
        "We do not sell, trade, or rent your personal information. Data is only shared with verified logistics partners solely for delivering your order to your address.",
    },
    {
      icon: Lock,
      title: "4. Data Security",
      content:
        "We implement advanced technical and organizational security measures to protect your personal details against unauthorized access, loss, or misuse.",
    },
    {
      icon: Cookie,
      title: "5. Cookies & Analytics",
      content:
        "We use essential session cookies to remember your shopping cart items and improve browsing performance. You can control cookies through browser settings.",
    },
    {
      icon: Key,
      title: "6. Your Privacy Rights",
      content:
        "You have the right to request access to your personal data, request correction of inaccurate info, or ask for complete account deletion by contacting our support team.",
    },
  ];

  return (
    <div className="bg-background text-foreground">
      <Helmet>
        <title>{`Privacy Policy | ${siteName}`}</title>
      </Helmet>

      {/* Hero Header */}
      <div className="border-b border-border bg-gradient-to-b from-primary/5 via-background to-background py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Shield className="size-3.5" /> Privacy & Trust
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Privacy Policy
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Your privacy is our top priority. Learn how {siteName} protects and manages your personal data.
          </p>
          <div className="mt-4 inline-block text-xs font-medium text-muted-foreground/80">
            Last updated: July 2026
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        {/* Highlights Grid */}
        <div className="grid gap-6 sm:grid-cols-3">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center shadow-xs transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">{item.title}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground border-b border-border pb-3">
            Privacy Commitments
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">{section.title}</h3>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Support CTA */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <HelpCircle className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Have privacy concerns?</h3>
              <p className="text-sm text-muted-foreground">Reach out to our data privacy team anytime.</p>
            </div>
          </div>
          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90"
          >
            Contact Support <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
