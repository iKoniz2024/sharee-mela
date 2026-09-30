"use client";

import { Truck, ShieldCheck, RotateCcw, Headset } from "lucide-react";
import { motion } from "framer-motion";
import FeatureCard from "./FeatureCard";

const FEATURES = [
  {
    icon: Truck,
    title: "Free Shipping",
    description:
      "Enjoy fast and free shipping on eligible orders with reliable delivery services.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    description:
      "Your payments are protected with trusted and secure payment methods.",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description:
      "Simple and hassle-free return policy for a worry-free shopping experience.",
  },
  {
    icon: Headset,
    title: "24/7 Support",
    description:
      "Our customer support team is always available to help you anytime.",
  },
];

export default function WhyChooseUs({ children }) {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center sm:mb-12"
        >
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Why Choose Us
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
            Experience secure shopping, fast delivery, and exceptional customer
            service with every order.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
