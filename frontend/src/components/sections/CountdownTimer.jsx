"use client";

import { useState, useEffect, useCallback } from "react";

function getTimeRemaining() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const diff = tomorrow.getTime() - now.getTime();

  return {
    days: 0,
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function TimeUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-background shadow-lg sm:h-14 sm:w-14">
        <span suppressHydrationWarning className="text-lg font-bold tabular-nums sm:text-xl">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="mt-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <div className="flex flex-col items-center gap-1.5 pb-5">
      <div className="size-1.5 rounded-full bg-muted-foreground/40" />
      <div className="size-1.5 rounded-full bg-muted-foreground/40" />
    </div>
  );
}

export default function CountdownTimer({ children }) {
  const [time, setTime] = useState(getTimeRemaining);

  const tick = useCallback(() => {
    setTime((prev) => {
      if (prev.seconds > 0) {
        return { ...prev, seconds: prev.seconds - 1 };
      }
      if (prev.minutes > 0) {
        return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
      }
      if (prev.hours > 0) {
        return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
      }
      return getTimeRemaining();
    });
  }, []);

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <TimeUnit value={time.hours} label="Hours" />
      <Separator />
      <TimeUnit value={time.minutes} label="Min" />
      <Separator />
      <TimeUnit value={time.seconds} label="Sec" />
    </div>
  );
}
