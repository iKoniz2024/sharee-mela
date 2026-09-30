"use client";

import { motion } from "framer-motion";

export default function FeatureCard({ feature, index }) {
  const Icon = feature.icon;

  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
          opacity: 1,
          y: 0,
          transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        }),
      }}
    >
      <div className="group flex h-full flex-col items-center gap-4 rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted transition-transform duration-300 group-hover:scale-110">
          <Icon className="size-7 text-foreground" strokeWidth={1.5} />
        </div>

        <div>
          <h3 className="text-base font-semibold text-foreground sm:text-lg">
            {feature.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
