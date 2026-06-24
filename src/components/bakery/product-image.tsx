"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  FALLBACK_PRODUCT_IMAGE,
  resolveProductImage,
} from "@/lib/product-images";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  name: string;
  category?: string;
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
}

export function ProductImage({
  name,
  category,
  src,
  alt,
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
  priority = false,
  fill = true,
}: ProductImageProps) {
  const resolved = resolveProductImage(src, name, category);
  const [currentSrc, setCurrentSrc] = useState(resolved);

  useEffect(() => {
    setCurrentSrc(resolveProductImage(src, name, category));
  }, [src, name, category]);

  const handleError = () => {
    if (currentSrc !== FALLBACK_PRODUCT_IMAGE) {
      setCurrentSrc(FALLBACK_PRODUCT_IMAGE);
    }
  };

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill={fill}
      priority={priority}
      sizes={sizes}
      className={cn("object-cover", className)}
      onError={handleError}
    />
  );
}
