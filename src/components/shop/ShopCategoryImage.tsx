"use client";

import type { LookCategory } from "@/lib/shop/catalogTypes";

interface Props {
  category: LookCategory;
  title: string;
  className?: string;
}

// Multiple images per category — picked by title hash for variety
const CATEGORY_PHOTOS: Record<LookCategory, { url: string; alt: string }[]> = {
  tshirt: [
    { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80", alt: "White t-shirt flat lay" },
    { url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&q=80", alt: "Graphic tee" },
    { url: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&q=80", alt: "Cotton crew neck" },
  ],
  shirt: [
    { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80", alt: "Button-down shirt" },
    { url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80", alt: "Dress shirt" },
    { url: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=400&q=80", alt: "Linen shirt" },
  ],
  jeans: [
    { url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80", alt: "Denim jeans" },
    { url: "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=400&q=80", alt: "Slim fit jeans" },
    { url: "https://images.unsplash.com/photo-1582552938357-34b9992466ef?w=400&q=80", alt: "Dark wash jeans" },
  ],
  trousers: [
    { url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80", alt: "Slim trousers" },
    { url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=80", alt: "Chinos" },
    { url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80", alt: "Formal trousers" },
  ],
  shorts: [
    { url: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&q=80", alt: "Casual shorts" },
    { url: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&q=80", alt: "Cargo shorts" },
  ],
  jacket: [
    { url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80", alt: "Leather jacket" },
    { url: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&q=80", alt: "Denim jacket" },
    { url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80", alt: "Blazer" },
  ],
  hoodie: [
    { url: "https://images.unsplash.com/photo-1556821840-3a63f756013f?w=400&q=80", alt: "Premium hoodie" },
    { url: "https://images.unsplash.com/photo-1578768079470-8d0a64bc128d?w=400&q=80", alt: "Oversized hoodie" },
  ],
  sweatshirt: [
    { url: "https://images.unsplash.com/photo-1578768079470-8d0a64bc128d?w=400&q=80", alt: "Crewneck sweatshirt" },
    { url: "https://images.unsplash.com/photo-1556821840-3a63f756013f?w=400&q=80", alt: "Zip sweatshirt" },
  ],
  sneakers: [
    { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", alt: "White sneakers" },
    { url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80", alt: "Colorful sneakers" },
    { url: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&q=80", alt: "High-top sneakers" },
  ],
  shoes: [
    { url: "https://images.unsplash.com/photo-1614252369475-ff36a467d8b9?w=400&q=80", alt: "Oxford shoes" },
    { url: "https://images.unsplash.com/photo-1614252369475-ff36a467d8b9?w=400&q=80", alt: "Loafers" },
  ],
  sandals: [
    { url: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80", alt: "Leather sandals" },
  ],
  watch: [
    { url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80", alt: "Classic watch" },
    { url: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=400&q=80", alt: "Smart watch" },
  ],
  sunglasses: [
    { url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80", alt: "Aviator sunglasses" },
    { url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80", alt: "Round sunglasses" },
  ],
  backpack: [
    { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80", alt: "Canvas backpack" },
  ],
  fragrance: [
    { url: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80", alt: "Cologne bottle" },
    { url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&q=80", alt: "Perfume bottle" },
  ],
  grooming: [
    { url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80", alt: "Grooming kit" },
  ],
  earrings: [
    { url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80", alt: "Gold earrings" },
  ],
  heels: [
    { url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80", alt: "Strappy heels" },
  ],
  flats: [
    { url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80", alt: "Pointed flats" },
  ],
  dress: [
    { url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80", alt: "Summer dress" },
    { url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80", alt: "Cocktail dress" },
  ],
  kurta: [
    { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80", alt: "Cotton kurta" },
  ],
  saree: [
    { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80", alt: "Silk saree" },
  ],
  accessory: [
    { url: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&q=80", alt: "Ring Light" },
    { url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80", alt: "Camera Lens" },
    { url: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&q=80", alt: "Fashion accessory" },
  ],
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function ShopCategoryImage({ category, title, className = "" }: Props) {
  const photos = CATEGORY_PHOTOS[category] || CATEGORY_PHOTOS.accessory;
  const photo = photos[hashString(title) % photos.length];

  return (
    <div className={`relative h-44 overflow-hidden rounded-xl ${className}`}>
      <img
        src={photo.url}
        alt={photo.alt}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-3 left-3">
        <span className="rounded-lg bg-black/50 px-2.5 py-1 text-[10px] font-medium text-[#1c1917]/90 backdrop-blur-sm">
          {title}
        </span>
      </div>
    </div>
  );
}
