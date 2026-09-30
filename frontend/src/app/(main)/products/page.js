import { Suspense } from "react";
import Products from "@/views/Products/Products";
import { getApiUrl } from "@/utils/getApiUrl";

export const metadata = {
  title: "All Products",
};

export const revalidate = 600;

async function fetchProductsData() {
  const baseUrl = getApiUrl();
  const fetchOpts = {
    next: { revalidate: 600 },
    headers: { Connection: "close" },
    signal: AbortSignal.timeout(15000),
  };

  try {
    const [categoriesRes, productsRes] = await Promise.all([
      fetch(`${baseUrl}/categories`, fetchOpts),
      fetch(`${baseUrl}/products?page=1&limit=12&sort=newest`, fetchOpts),
    ]);

    return {
      categoriesData: categoriesRes.ok ? await categoriesRes.json() : [],
      productsData: productsRes.ok ? await productsRes.json() : { products: [], totalPages: 1, totalProducts: 0 },
    };
  } catch (err) {
    console.error("Failed to fetch products page data:", err.message);
    return {
      categoriesData: [],
      productsData: { products: [], totalPages: 1, totalProducts: 0 },
    };
  }
}

export default async function Page() {
  const initialData = await fetchProductsData();

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading Products...</div>}>
      <Products initialCategories={initialData.categoriesData} initialProducts={initialData.productsData} />
    </Suspense>
  );
}
