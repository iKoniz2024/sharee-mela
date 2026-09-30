import BestSellingProducts from "@/components/sections/BestSellingProducts";
import { getApiUrl } from "@/utils/getApiUrl";

export const metadata = {
  title: "Best Selling Products",
};

export const revalidate = 600;

async function fetchBestSelling() {
  try {
    const baseUrl = getApiUrl();
    const res = await fetch(`${baseUrl}/products/best-sellers`, {
      next: { revalidate: 600 },
      headers: { Connection: "close" },
      signal: AbortSignal.timeout(15000),
    });
    return res.ok ? await res.json() : { products: [] };
  } catch (err) {
    console.error("Failed to fetch best-selling products:", err.message);
    return { products: [] };
  }
}

export default async function Page() {
  const initialData = await fetchBestSelling();

  return (
    <div className="min-h-screen bg-background pt-8 pb-16">
      <BestSellingProducts initialData={initialData} />
    </div>
  );
}
