import FlashSale from "@/components/sections/FlashSale";
import { getApiUrl } from "@/utils/getApiUrl";

export const metadata = {
  title: "Flash Sale",
};

export const revalidate = 600;

async function fetchFlashSale() {
  try {
    const baseUrl = getApiUrl();
    const res = await fetch(`${baseUrl}/products/flash-sale`, {
      next: { revalidate: 600 },
      headers: { Connection: "close" },
      signal: AbortSignal.timeout(15000),
    });
    return res.ok ? await res.json() : { products: [] };
  } catch (err) {
    console.error("Failed to fetch flash-sale products:", err.message);
    return { products: [] };
  }
}

export default async function Page() {
  const initialData = await fetchFlashSale();

  return (
    <div className="min-h-screen bg-background pt-8 pb-16">
      <FlashSale initialData={initialData} />
    </div>
  );
}
