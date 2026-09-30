import { cache } from "react";
import ProductDetails from "@/views/Products/ProductDetails";
import { getApiUrl } from "@/utils/getApiUrl";

export const revalidate = 600; // Cache for 600 seconds

const getProduct = cache(async (id) => {
  try {
    const baseUrl = getApiUrl();
    const res = await fetch(`${baseUrl}/products/${id}`, {
      next: { revalidate: 600 },
      headers: { Connection: "close" },
      signal: AbortSignal.timeout(15000),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.warn(`Server fetch for product ${id} timed out or failed, falling back to client fetch.`);
  }
  return null;
});

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (product) {
    return {
      title: product.title,
      description: product.description ? product.description.slice(0, 160) : "Product details at Sharee Mela",
      openGraph: {
        title: product.title,
        description: product.description ? product.description.slice(0, 160) : "",
        images: product.thumbnail ? [product.thumbnail] : [],
      },
    };
  }
  return {
    title: "Product Details",
  };
}

export default async function Page({ params }) {
  const { id } = await params;
  const initialData = await getProduct(id);

  return <ProductDetails id={id} initialData={initialData} />;
}

