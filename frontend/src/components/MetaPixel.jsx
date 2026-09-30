"use client";

import Script from "next/script";
import useSettings from "@/hooks/useSettings";

export default function MetaPixel() {
  const { metaPixels, metaPixelId } = useSettings();

  let pixelIds = [];

  if (Array.isArray(metaPixels) && metaPixels.length > 0) {
    pixelIds = metaPixels
      .map((item) => (item?.pixelId || "").trim())
      .filter((id) => /^\d+$/.test(id));
  } else if (metaPixelId && metaPixelId.trim()) {
    pixelIds = metaPixelId
      .split(",")
      .map((id) => id.trim())
      .filter((id) => /^\d+$/.test(id));
  }

  if (pixelIds.length === 0) {
    return null;
  }

  const initScripts = pixelIds.map((id) => `fbq('init', '${id}');`).join("\n");

  return (
    <>
      <Script
        id="meta-pixel-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            ${initScripts}
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        {pixelIds.map((id) => (
          <img
            key={id}
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
            alt=""
          />
        ))}
      </noscript>
    </>
  );
}
