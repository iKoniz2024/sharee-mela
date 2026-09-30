"use client";

import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";
import usePageTitle from "@/hooks/usePageTitle";
import Link from "next/link";
import {
  FileText,
  CheckSquare,
  Tag,
  ShoppingBag,
  CreditCard,
  Copyright,
  Scale,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

export default function Terms({ children }) {
  const { siteName } = useSettings();
  usePageTitle("Terms & Conditions");

  const highlights = [
    {
      icon: CheckSquare,
      title: "Clear Agreement",
      description: "Simple, fair terms protecting both customer and merchant rights.",
    },
    {
      icon: Tag,
      title: "Transparent Pricing",
      description: "All prices are inclusive of taxes with no hidden checkout fees.",
    },
    {
      icon: Scale,
      title: "Consumer Rights",
      description: "Full protection adhering to national digital commerce standards.",
    },
  ];

  const sections = [
    {
      icon: CheckSquare,
      title: "1. Acceptance of Terms",
      content: `By accessing or purchasing from ${siteName}, you agree to comply with and be bound by these Terms and Conditions. Please review them carefully before ordering.`,
    },
    {
      icon: Tag,
      title: "2. Products & Pricing",
      content:
        "We strive to display accurate product details, stock levels, and prices. Prices and availability are subject to change without prior notice.",
    },
    {
      icon: ShoppingBag,
      title: "3. Order Placement & Cancellation",
      content:
        "All orders placed are subject to acceptance and verification. We reserve the right to decline or cancel an order in case of stock unavailability or price discrepancy.",
    },
    {
      icon: CreditCard,
      title: "4. Payments & Security",
      content:
        "Full payment or Cash on Delivery (COD) confirmation is required to process shipment. Online transactions are processed via secure encrypted gateways.",
    },
    {
      icon: Copyright,
      title: "5. Intellectual Property",
      content: `All design elements, logos, product photos, graphics, and textual content on this website remain the exclusive property of ${siteName}.`,
    },
    {
      icon: Scale,
      title: "6. Limitation of Liability",
      content: `${siteName} shall not be liable for any indirect, incidental, or consequential damages resulting from product use or service delays.`,
    },
  ];

  return (
    <div className="bg-background text-foreground">
      <Helmet>
        <title>{`Terms & Conditions | ${siteName}`}</title>
      </Helmet>

      {/* Hero Header */}
      <div className="border-b border-border bg-gradient-to-b from-primary/5 via-background to-background py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <FileText className="size-3.5" /> Legal Terms
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Terms & Conditions
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Welcome to {siteName}. Please read our standard terms of service governing your store use.
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
            Terms Overview
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
              <h3 className="text-lg font-bold text-foreground">Questions about our Terms?</h3>
              <p className="text-sm text-muted-foreground">Our team is available to assist with any legal queries.</p>
            </div>
          </div>
          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90"
          >
            Contact Us <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
