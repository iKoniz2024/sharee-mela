"use client";

import { motion } from "framer-motion";
import { Star, BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-4 ${
            i < Math.round(rating)
              ? "fill-foreground text-foreground"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
}

export default function ReviewCard({ review, index }) {
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
          transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        }),
      }}
    >
      <div className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="mb-4 flex items-center gap-3">
          <Avatar size="lg">
            <AvatarFallback className="bg-foreground text-sm font-semibold text-background">
              {getInitials(review.reviewerName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h4 className="text-sm font-semibold text-foreground">
              {review.reviewerName}
            </h4>
            <p className="text-xs text-muted-foreground">
              {formatDate(review.date)}
            </p>
          </div>

          <Badge variant="secondary" className="gap-1 text-[10px]">
            <BadgeCheck className="size-3 text-foreground" />
            Verified
          </Badge>
        </div>

        <StarRating rating={review.rating} />

        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          &ldquo;{review.comment}&rdquo;
        </p>
      </div>
    </motion.div>
  );
}
