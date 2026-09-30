"use client";

export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded border border-border px-3 py-2 outline-none focus:border-ring ${className}`.trim()}
      {...props}
    />
  );
}
