"use client";

import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";
import usePageTitle from "@/hooks/usePageTitle";
import Link from "next/link";
import {
  RotateCcw,
  ShieldCheck,
  PackageX,
  RefreshCw,
  CreditCard,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function ReturnPolicy({ children }) {
  const { siteName } = useSettings();
  usePageTitle("Return Policy");

  const highlights = [
    {
      icon: Clock,
      title: "7 Days Return Window",
      description: "Return most items within 7 days of delivery in original condition.",
    },
    {
      icon: CreditCard,
      title: "Fast Refund Processing",
      description: "Refunds processed within 5-7 business days directly to your payment method.",
    },
    {
      icon: RefreshCw,
      title: "Hassle-free Exchange",
      description: "Easy size or color exchange for equal value items.",
    },
  ];

  const sections = [
    {
      icon: ShieldCheck,
      title: "1. Return Eligibility",
      content:
        "You may return most items within 7 days of delivery. Items must be unused, unwashed, with tags attached, in original packaging, and in the same condition as received.",
    },
    {
      icon: PackageX,
      title: "2. Non-Returnable Items",
      content:
        "Certain items cannot be returned due to hygiene and customization reasons, including perishable goods, personal care items, custom-made apparel, and gift cards.",
    },
    {
      icon: RotateCcw,
      title: "3. Return Process",
      content:
        "To initiate a return, contact our support team with your order number. Our representative will guide you through packaging and courier return instructions.",
    },
    {
      icon: CreditCard,
      title: "4. Refunds & Timelines",
      content:
        "Refunds are processed within 5-7 business days after we receive and inspect the returned package. The amount will be credited back to your original payment account.",
    },
    {
      icon: RefreshCw,
      title: "5. Exchanges",
      content:
        "We offer seamless exchanges for items of equal value. Contact us to arrange an exchange for a different size, color, or variant.",
    },
    {
      icon: AlertCircle,
      title: "6. Damaged or Defective Items",
      content:
        "If you receive a damaged or defective item, please notify us within 48 hours of delivery with photo/video evidence. We will arrange a free replacement or instant full refund.",
    },
  ];

  return (
    <div className="bg-background text-foreground">
      <Helmet>
        <title>{`Return Policy | ${siteName}`}</title>
      </Helmet>

      {/* Hero Header */}
      <div className="border-b border-border bg-gradient-to-b from-primary/5 via-background to-background py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <RotateCcw className="size-3.5" /> Customer Protection
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Return & Exchange Policy
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            We want you to be completely satisfied with your purchase. Read our transparent return guidelines below.
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
            Policy Details
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

        {/* Support CTA Banner */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <HelpCircle className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Need help with a return?</h3>
              <p className="text-sm text-muted-foreground">Our support team is here to assist you 24/7.</p>
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
