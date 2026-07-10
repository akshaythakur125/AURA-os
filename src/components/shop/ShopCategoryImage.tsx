"use client";

import type { LookCategory } from "@/lib/shop/catalogTypes";

interface Props {
  category: LookCategory;
  title: string;
  className?: string;
}

// Real product photos from Unsplash — makes shop feel like stylist picks, not generic SVGs
const CATEGORY_PHOTOS: Record<LookCategory, { url: string; alt: string }> = {
  tshirt: { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80", alt: "White t-shirt flat lay" },
  shirt: { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80", alt: "Button-down shirt" },
  jeans: { url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80", alt: "Denim jeans" },
  trousers: { url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80", alt: "Slim trousers" },
  shorts: { url: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&q=80", alt: "Casual shorts" },
  jacket: { url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80", alt: "Leather jacket" },
  hoodie: { url: "https://images.unsplash.com/photo-1556821840-3a63f756013f?w=400&q=80", alt: "Premium hoodie" },
  sweatshirt: { url: "https://images.unsplash.com/photo-1578768079470-8d0a64bc128d?w=400&q=80", alt: "Crewneck sweatshirt" },
  sneakers: { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", alt: "White sneakers" },
  shoes: { url: "https://images.unsplash.com/photo-1614252369475-ff36a467d8b9?w=400&q=80", alt: "Oxford shoes" },
  sandals: { url: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80", alt: "Leather sandals" },
  watch: { url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80", alt: "Classic watch" },
  sunglasses: { url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80", alt: "Aviator sunglasses" },
  backpack: { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80", alt: "Canvas backpack" },
  fragrance: { url: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80", alt: "Cologne bottle" },
  grooming: { url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80", alt: "Grooming kit" },
  earrings: { url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80", alt: "Gold earrings" },
  heels: { url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80", alt: "Strappy heels" },
  flats: { url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80", alt: "Pointed flats" },
  dress: { url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80", alt: "Summer dress" },
  kurta: { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80", alt: "Cotton kurta" },
  saree: { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80", alt: "Silk saree" },
  accessory: { url: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&q=80", alt: "Fashion accessory" },
};

export function ShopCategoryImage({ category, title, className = "" }: Props) {
  const photo = CATEGORY_PHOTOS[category] || CATEGORY_PHOTOS.accessory;

  return (
    <div className={`relative h-44 overflow-hidden rounded-xl ${className}`}>
      <img
        src={photo.url}
        alt={photo.alt}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      {/* Title badge */}
      <div className="absolute bottom-3 left-3">
        <span className="rounded-lg bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-sm">
          {title}
        </span>
      </div>
    </div>
  );
}
