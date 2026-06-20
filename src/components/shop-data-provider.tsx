"use client";

import { useEffect } from "react";
import { fetchCategories } from "@/lib/api/categories";
import { fetchProducts } from "@/lib/api/products";
import { fetchRiders } from "@/lib/api/riders";
import { fetchStores } from "@/lib/api/stores";
import { apiFetch } from "@/lib/api/fetcher";
import { mapEvent, mapProduct, mapReview, mapRider, mapStore } from "@/lib/mappers";
import type { DbEvent, DbReview } from "@/lib/types/database";
import { useAppDispatch } from "@/lib/redux-hooks";
import {
  setCategories,
  setDataError,
  setDataLoaded,
  setEvents,
  setProducts,
  setReviews,
  setRiders,
  setStores,
} from "@/lib/store";

async function safeFetch<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export function ShopDataProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;

    async function loadShopData() {
      const errors: string[] = [];

      const [categories, products, stores, riders, reviews, events] =
        await Promise.all([
          safeFetch(fetchCategories, []),
          safeFetch(fetchProducts, []),
          safeFetch(fetchStores, []),
          safeFetch(fetchRiders, []),
          safeFetch(
            () => apiFetch<{ data: DbReview[] }>("/api/reviews").then((r) => r.data),
            [],
          ),
          safeFetch(
            () => apiFetch<{ data: DbEvent[] }>("/api/events").then((r) => r.data),
            [],
          ),
        ]);

      if (cancelled) return;

      // Only replace Redux state when Supabase returned data
      if (categories.length > 0) dispatch(setCategories(categories));
      if (products.length > 0) dispatch(setProducts(products.map(mapProduct)));
      if (stores.length > 0) dispatch(setStores(stores.map(mapStore)));
      if (riders.length > 0) dispatch(setRiders(riders.map(mapRider)));
      if (reviews.length > 0) dispatch(setReviews(reviews.map(mapReview)));
      if (events.length > 0) dispatch(setEvents(events.map(mapEvent)));

      const hasData =
        products.length > 0 || stores.length > 0 || riders.length > 0;

      if (!hasData) {
        errors.push(
          "Using local sample data. Run the schema migration and POST /api/seed to connect Supabase.",
        );
      }

      dispatch(setDataError(errors.length > 0 ? errors.join(" ") : null));
      dispatch(setDataLoaded(true));
    }

    loadShopData();
    return () => { cancelled = true; };
  }, [dispatch]);

  return <>{children}</>;
}
