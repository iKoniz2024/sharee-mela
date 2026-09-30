"use client";

import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";
import usePageTitle from "@/hooks/usePageTitle";
import Link from "next/link";
import {
  Truck,
  MapPin,
  Clock,
  Banknote,
  Search,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

export default function DeliveryRules({ children }) {
  const { siteName } = useSettings();
  usePageTitle("Delivery Rules");

  const highlights = [
    {
      icon: Clock,
      title: "Fast Shipping",
      description: "3-5 days in Dhaka, 5-7 days across Bangladesh.",
    },
    {
      icon: Banknote,
      title: "Low Courier Charge",
      description: "৳60 inside Dhaka, ৳120 outside Dhaka.",
    },
    {
      icon: Search,
      title: "Live Order Tracking",
      description: "Real-time SMS & online order tracking available.",
    },
  ];

  const sections = [
    {
      icon: MapPin,
      title: "1. Delivery Coverage",
      content:
        "We deliver to all major districts and upazilas across Bangladesh. International shipping is currently unavailable.",
    },
    {
      icon: Clock,
      title: "2. Delivery Timelines",
      content:
        "Standard delivery takes 3-5 business days within Dhaka Metro and 5-7 business days outside Dhaka. Express delivery options are available for urgent orders.",
    },
    {
      icon: Banknote,
      title: "3. Shipping Rates",
      content:
        "Shipping cost is flat ৳60 for delivery inside Dhaka city and ৳120 for delivery outside Dhaka. Free shipping offers apply during special store campaigns.",
    },
    {
      icon: Search,
      title: "4. Tracking Your Order",
      content:
        "Once your package is handed over to our courier partner, you will receive a tracking link via SMS. You can also track anytime from our Track Order page.",
    },
    {
      icon: CheckCircle2,
      title: "5. Delivery Instructions",
      content:
        "Please provide accurate recipient name, phone number, and detailed address. The delivery agent will call before attempting delivery.",
    },
    {
      icon: AlertTriangle,
      title: "6. Re-delivery & Failed Attempts",
      content:
        "If a delivery attempt fails due to customer unavailability or unreachable phone number, redelivery will be re-attempted. Repeated failed attempts may incur additional shipping fee.",
    },
  ];

  return (
    <div className="bg-background text-foreground">
      <Helmet>
        <title>{`Delivery Rules | ${siteName}`}</title>
      </Helmet>

      {/* Hero Header */}
      <div className="border-b border-border bg-gradient-to-b from-primary/5 via-background to-background py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Truck className="size-3.5" /> Shipping & Logistics
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Delivery Policy & Rules
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Everything you need to know about shipping rates, delivery times, and order dispatch across Bangladesh.
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
            Delivery Guidelines
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

        {/* Track Order CTA */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Search className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Want to track your package?</h3>
              <p className="text-sm text-muted-foreground">Check instant delivery status using your phone or order ID.</p>
            </div>
          </div>
          <Link
            href="/orders"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90"
          >
            Track Order <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
