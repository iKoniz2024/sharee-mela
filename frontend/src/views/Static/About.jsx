"use client";

import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";
import usePageTitle from "@/hooks/usePageTitle";
import Link from "next/link";
import {
  Shield,
  Truck,
  Headphones,
  Heart,
  Target,
  Users,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

const FEATURES = [
  {
    icon: Shield,
    title: "Trusted & Secure",
    description: "Your data and transactions are protected with industry-leading security measures.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "We deliver your orders quickly and reliably right to your doorstep across Bangladesh.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our dedicated support team is always ready to assist you with any queries.",
  },
];

const VALUES = [
  {
    icon: Heart,
    title: "Customer First",
    description: "Every decision we make starts with our customers. Your satisfaction is our top priority.",
  },
  {
    icon: Target,
    title: "Quality Guarantee",
    description: "We carefully curate our products to ensure you receive only the finest quality.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "We believe in building a community of loyal customers who share our vision.",
  },
];

export default function About({ children }) {
  const { siteName } = useSettings();
  usePageTitle("About Us");

  return (
    <div className="bg-background text-foreground">
      <Helmet>
        <title>{`About Us | ${siteName}`}</title>
      </Helmet>

      {/* Hero Header */}
      <div className="border-b border-border bg-gradient-to-b from-primary/5 via-background to-background py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" /> Our Story & Mission
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            About {siteName}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Discovering exquisite traditional, Jamdani, Silk & designer sarees crafted with elegance and uncompromised quality.
          </p>
          <div className="mt-4 inline-block text-xs font-medium text-muted-foreground/80">
            Last updated: August 2026
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        {/* Story Section */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl font-bold tracking-tight text-foreground border-b border-border pb-3">
            Who We Are
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Welcome to <strong className="text-foreground">{siteName}</strong> — your premier destination for authentic Sharees, featuring Jamdani, Katan, Georgette, Silk, and designer collections at competitive prices. We started with a simple mission: to bring timeless Bengali heritage and modern saree fashion right to your doorstep.
          </p>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Founded with a commitment to craftsmanship and authenticity, we have grown into a trusted e-commerce platform serving thousands of satisfied customers across the country.
          </p>
        </div>

        {/* What We Offer */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground border-b border-border pb-3">
            What We Offer
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center shadow-xs transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-foreground">{feature.title}</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Our Values */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground border-b border-border pb-3">
            Our Core Values
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center shadow-xs transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-foreground">{value.title}</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why Choose Us List */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl font-bold tracking-tight text-foreground border-b border-border pb-3">
            Why Choose {siteName}?
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "Exquisite range of Jamdani, Katan, Silk, Cotton & Designer Sarees",
              "Competitive prices with exclusive offers & deals",
              "Fast and reliable delivery across Bangladesh",
              "Multiple secure payment methods including COD",
              "Transparent and easy 7-day return policy",
              "Dedicated customer support team available 24/7",
            ].map((reason, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle2 className="size-5 shrink-0 text-primary" />
                <span className="text-sm text-foreground font-medium">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <ShoppingBag className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Explore Our Collections</h3>
              <p className="text-sm text-muted-foreground">Discover the latest trending products and deals.</p>
            </div>
          </div>
          <Link
            href="/products"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90"
          >
            Shop Now <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
