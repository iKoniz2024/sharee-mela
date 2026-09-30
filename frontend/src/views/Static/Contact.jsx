"use client";

import { Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";

import usePageTitle from "@/hooks/usePageTitle";

export default function Contact({ children }) {
  const { siteName, contactEmail, contactPhone, address, googleMapLink } = useSettings();
  usePageTitle("Contact Us");
  return (
    <div className="bg-background">
      <Helmet>
        <title>{`Contact Us | ${siteName}`}</title>
      </Helmet>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground">Contact Us</h1>
        <p className="mt-2 text-muted-foreground">
          Have questions? We&apos;d love to hear from you.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <Phone className="mx-auto size-8 text-primary" />
            <h3 className="mt-3 font-semibold text-foreground">Phone</h3>
            <p className="mt-1 text-sm text-muted-foreground">{contactPhone || "+880 1XXXXXXXXX"}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <Mail className="mx-auto size-8 text-primary" />
            <h3 className="mt-3 font-semibold text-foreground">Email</h3>
            <p className="mt-1 text-sm text-muted-foreground">{contactEmail || "support@infinitystore.com"}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <MapPin className="mx-auto size-8 text-primary" />
            <h3 className="mt-3 font-semibold text-foreground">Address</h3>
            <p className="mt-1 text-sm text-muted-foreground">{address || "Dhaka, Bangladesh"}</p>
          </div>
        </div>

        {googleMapLink && (
          <div className="mt-8">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-md">
              <div className="flex items-center gap-2 border-b border-border bg-card px-5 py-3">
                <MapPin className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Our Location</h3>
              </div>
              {googleMapLink.includes("/maps/embed") ? (
                <iframe
                  src={googleMapLink}
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-16">
                  <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="size-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Click below to view our location on Google Maps</p>
                  <a
                    href={googleMapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <ExternalLink className="size-4" />
                    Open in Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
