import type { CommerceProduct } from "@/types/commerce";
import { WARDROBE_CATALOG } from "@/config/auraWardrobeCatalog";
import { getItem, setItem } from "./localStore";

const ADMIN_CATALOG_KEY = "auracheck:v1:commerce_admin_catalog";

export type CatalogSource = "static" | "local" | "supabase";

export function getAdminCatalog(): CommerceProduct[] {
  return getItem<CommerceProduct[]>(ADMIN_CATALOG_KEY, []);
}

export function saveAdminCatalog(products: CommerceProduct[]): void {
  setItem(ADMIN_CATALOG_KEY, products);
}

export function clearAdminCatalog(): void {
  setItem(ADMIN_CATALOG_KEY, []);
}

export function getCatalogSource(): CatalogSource {
  if (typeof window === "undefined") return "static";
  const admin = getAdminCatalog();
  if (admin.length > 0) return "local";
  return "static";
}

export function getEffectiveCatalog(): CommerceProduct[] {
  const admin = getAdminCatalog();
  if (admin.length > 0) return admin;
  return WARDROBE_CATALOG;
}

export function getActiveProducts(): CommerceProduct[] {
  return getEffectiveCatalog().filter((p) => p.isActive);
}

export function getProductById(id: string): CommerceProduct | undefined {
  return getEffectiveCatalog().find((p) => p.id === id);
}

export function addProductToAdmin(product: CommerceProduct): void {
  const catalog = getAdminCatalog();
  catalog.push(product);
  saveAdminCatalog(catalog);
}

export function updateProductInAdmin(id: string, updates: Partial<CommerceProduct>): boolean {
  const catalog = getAdminCatalog();
  const idx = catalog.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  catalog[idx] = { ...catalog[idx], ...updates, updatedAt: new Date().toISOString() };
  saveAdminCatalog(catalog);
  return true;
}

export function deleteProductFromAdmin(id: string): boolean {
  const catalog = getAdminCatalog();
  const filtered = catalog.filter((p) => p.id !== id);
  if (filtered.length === catalog.length) return false;
  saveAdminCatalog(filtered);
  return true;
}

export function setProductActive(id: string, isActive: boolean): boolean {
  return updateProductInAdmin(id, { isActive });
}
