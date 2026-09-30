import Home from "@/views/Home/Home";
import { getApiUrl } from "@/utils/getApiUrl";

export const metadata = {
  title: "Home",
};

export const revalidate = 600;

async function fetchHomeData() {
  const baseUrl = getApiUrl();
  const fetchOpts = {
    next: { revalidate: 600 },
    headers: { Connection: "close" },
    signal: AbortSignal.timeout(15000),
  };

  try {
    const [
      categoriesRes,
      newArrivalsRes,
      bestSellingRes,
      flashSaleRes,
      bannersRes
    ] = await Promise.all([
      fetch(`${baseUrl}/categories`, fetchOpts),
      fetch(`${baseUrl}/products/new-arrivals`, fetchOpts),
      fetch(`${baseUrl}/products/best-sellers`, fetchOpts),
      fetch(`${baseUrl}/products/flash-sale`, fetchOpts),
      fetch(`${baseUrl}/banners`, fetchOpts),
    ]);

    return {
      categoriesData: categoriesRes.ok ? await categoriesRes.json() : [],
      newArrivalsData: newArrivalsRes.ok ? await newArrivalsRes.json() : { products: [] },
      bestSellingData: bestSellingRes.ok ? await bestSellingRes.json() : { products: [] },
      flashSaleData: flashSaleRes.ok ? await flashSaleRes.json() : { products: [] },
      bannersData: bannersRes.ok ? await bannersRes.json() : [],
    };
  } catch (err) {
    console.error("Failed to fetch home page data:", err.message);
    return {
      categoriesData: [],
      newArrivalsData: { products: [] },
      bestSellingData: { products: [] },
      flashSaleData: { products: [] },
      bannersData: [],
    };
  }
}

export default async function Page() {
  const initialData = await fetchHomeData();

  return <Home initialData={initialData} />;
}
