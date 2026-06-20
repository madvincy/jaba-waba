import type {
  DbEvent,
  DbProduct,
  DbReview,
  DbRider,
  DbStoreWithInventory,
} from "@/lib/types/database";
import type {
  EventItem,
  Product,
  ProductCategory,
  Review,
  RiderProfile,
  StoreLocation,
} from "@/lib/store";

export function mapProduct(row: DbProduct): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category as ProductCategory,
    description: row.description,
    price: Number(row.price),
    image: (row as any).image,
    stock: (row as any).stock ?? 0,
    tags: (row as any).tags ?? [],
    images: (row as any).images ?? [],
    variants: (row as any).variants ?? [],
    totalStock: (row as any).totalStock ?? (row as any).stock ?? 0,
    available: (row as any).available ?? ((row as any).stock ?? 0) > 0,
  };
}

export function mapStore(row: DbStoreWithInventory): StoreLocation {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    inventory: row.inventory.map((item) => ({
      productId: item.product_id,
      stock: item.stock,
    })),
  };
}

export function mapRider(row: DbRider): RiderProfile {
  return {
    id: row.id,
    name: row.name,
    area: row.area,
    available: row.available,
    status: row.status,
    currentOrderId: row.current_order_id ?? undefined,
  };
}

export function mapReview(row: DbReview): Review {
  return {
    id: row.id,
    customer: row.customer,
    rating: row.rating,
    text: row.text,
    source: row.source,
    date: row.date,
  };
}

export function mapEvent(row: DbEvent): EventItem {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    location: row.location,
    description: row.description,
  };
}
