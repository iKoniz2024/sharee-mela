"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSettings } from "../services/settings.api";

import { getApiUrl } from "../utils/getApiUrl";

const useSettings = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
    staleTime: 10 * 60 * 1000,
  });

  const logo = data?.logo || null;

  useEffect(() => {
    if (logo && typeof document !== "undefined") {
      const apiUrl = getApiUrl();
      const logoVersion = logo ? `?v=${encodeURIComponent(logo.slice(-12))}` : "";
      const logoUrl = `${apiUrl}/settings/logo${logoVersion}`;

      const iconLinks = document.querySelectorAll("link[rel*='icon']");
      if (iconLinks.length > 0) {
        iconLinks.forEach((link) => {
          link.href = logoUrl;
        });
      } else {
        const link = document.createElement("link");
        link.rel = "shortcut icon";
        link.href = logoUrl;
        document.head.appendChild(link);
      }
    }
  }, [logo]);

  return {
    siteName: data?.siteName || "Sharee Mela",
    logo,
    contactEmail: data?.contactEmail || "",
    contactPhone: data?.contactPhone || "",
    address: data?.address || "",
    googleMapLink: data?.googleMapLink || "",
    facebookUrl: data?.facebookUrl || "",
    instagramUrl: data?.instagramUrl || "",
    tiktokUrl: data?.tiktokUrl || "",
    youtubeUrl: data?.youtubeUrl || "",
    metaPixelId: data?.metaPixelId || "",
    metaPixels: Array.isArray(data?.metaPixels) ? data.metaPixels : [],
    isLoading,
  };
};

export default useSettings;
