import { apiFetch, ApiPaged, ApiResponse, toFormData } from './client';
import { Product } from '../data/mockData';

/** Backend TProduct (backend/src/utils/interfaces/common.ts) — the raw API shape. */
interface ApiProduct {
  id: string;
  merchantId?: string | null;
  name: string;
  slug: string;
  isFeatured?: boolean;
  description: string;
  teaser: string;
  price: number;
  discountPercentage?: number | null;
  category: 'SEDANS' | 'SUVS' | 'SPORTS_CARS' | 'LUXURY';
  stockQuantity: number;
  thumbnail: string;
  galleryImages?: string[];
  rating?: number | null;
  reviews?: { count: number; rating: number } | null;
}

const CATEGORY_LABEL: Record<ApiProduct['category'], Product['category']> = {
  SEDANS: 'Sedans',
  SUVS: 'SUVs',
  SPORTS_CARS: 'Sports Cars',
  LUXURY: 'Luxury',
};

/**
 * Maps the backend's wire format to the frontend's existing `Product` shape
 * (front-end/src/app/data/mockData.ts) so pages built against mock data
 * don't need to change beyond swapping their data source — see
 * ai-workflow-rules.md's mock-to-backend transition guidance.
 *
 * Price direction: the backend stores `price` as the *pre-discount* price
 * and applies `discountPercentage` at checkout time (see
 * backend/src/services/OrderService.ts calculateTotalForItems) — the
 * opposite of the frontend's `price`/`compareAtPrice` pair, where `price`
 * is what the customer actually pays and `compareAtPrice` is the
 * crossed-out original. This adapter is where that inversion is resolved,
 * once, rather than in every page that renders a price.
 */
function toProduct(p: ApiProduct): Product {
  const hasDiscount = !!p.discountPercentage && p.discountPercentage > 0;
  const price = hasDiscount ? p.price * (1 - p.discountPercentage! / 100) : p.price;
  // `thumbnail` is a required field on the backend, so this is never empty.
  const images = [p.thumbnail, ...(p.galleryImages ?? [])].filter(Boolean);

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    shortDescription: p.teaser,
    price,
    compareAtPrice: hasDiscount ? p.price : undefined,
    category: CATEGORY_LABEL[p.category],
    images,
    inventory: p.stockQuantity,
    featured: p.isFeatured ?? false,
    rating: p.reviews?.rating ?? p.rating ?? 0,
    reviewCount: p.reviews?.count ?? 0,
    // Not yet exposed by the API — ProductService doesn't include the
    // merchant relation (out of scope for Day 3's read-wiring pass).
    // `Product.merchantName` is optional and every consumer already
    // guards for its absence.
    merchantName: undefined,
  };
}

export async function getAllProducts(params?: {
  searchq?: string;
  limit?: number;
  page?: number;
}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.searchq) query.set('searchq', params.searchq);
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.page) query.set('page', String(params.page));
  const qs = query.toString();

  const res = await apiFetch<ApiPaged<ApiProduct[]>>(`/product${qs ? `?${qs}` : ''}`);
  return (res.data ?? []).map(toProduct);
}

export async function getProductCount(): Promise<number> {
  const res = await apiFetch<ApiPaged<ApiProduct[]>>('/product?limit=1');
  return res.totalItems;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const res = await apiFetch<ApiPaged<ApiProduct[]>>('/product/featured');
  return (res.data ?? []).map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await apiFetch<ApiResponse<ApiProduct>>(`/product/slug/${encodeURIComponent(slug)}`);
    return res.data ? toProduct(res.data) : null;
  } catch {
    return null;
  }
}

// --- Admin/merchant CRUD ---
// These work with the backend's raw shape directly rather than the adapted
// `Product` display type — `toProduct`'s price inversion (see above) is
// meant for rendering a sale price, and reversing it for an edit form would
// be lossier than just editing the real backend fields (price,
// discountPercentage, category enum) directly.

export type AdminProductCategory = ApiProduct['category'];

export interface AdminProduct {
  id: string;
  merchantId?: string | null;
  name: string;
  slug: string;
  teaser: string;
  description: string;
  price: number;
  discountPercentage?: number | null;
  category: AdminProductCategory;
  brand?: string | null;
  model?: string | null;
  warranty?: string | null;
  stockQuantity: number;
  thumbnail: string;
  isFeatured: boolean;
  isActive: boolean;
}

export const PRODUCT_CATEGORIES: { value: AdminProductCategory; label: string }[] = [
  { value: 'SEDANS', label: 'Sedans' },
  { value: 'SUVS', label: 'SUVs' },
  { value: 'SPORTS_CARS', label: 'Sports Cars' },
  { value: 'LUXURY', label: 'Luxury' },
];

export async function getAdminProduct(id: string): Promise<AdminProduct> {
  const res = await apiFetch<ApiResponse<AdminProduct>>(`/product/${id}`);
  return res.data!;
}

export interface ProductInput {
  name: string;
  teaser: string;
  description: string;
  price: number;
  discountPercentage?: number;
  category: AdminProductCategory;
  brand?: string;
  model?: string;
  warranty?: string;
  stockQuantity: number;
  thumbnail: string;
  isFeatured?: boolean;
  merchantId?: string;
}

export async function createProduct(
  input: ProductInput,
  token: string,
  thumbnailFile?: File,
): Promise<AdminProduct> {
  const body = thumbnailFile ? toFormData(input, { thumbnail: thumbnailFile }) : input;
  const res = await apiFetch<ApiResponse<AdminProduct>>('/product', {
    method: 'POST',
    body,
    token,
  });
  return res.data!;
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
  token: string,
  thumbnailFile?: File,
): Promise<AdminProduct> {
  const body = thumbnailFile ? toFormData(input, { thumbnail: thumbnailFile }) : input;
  const res = await apiFetch<ApiResponse<AdminProduct>>(`/product/${id}`, {
    method: 'PUT',
    body,
    token,
  });
  return res.data!;
}

export async function deleteProduct(id: string, token: string): Promise<void> {
  await apiFetch(`/product/${id}`, { method: 'DELETE', token });
}
