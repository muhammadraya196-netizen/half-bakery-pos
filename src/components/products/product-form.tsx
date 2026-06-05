"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { productSchema, type ProductFormData } from "@/lib/validations/product";
import { CATEGORIES } from "@/lib/mock-data";
import type { Product } from "@/types";

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProductForm({ product, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
          sku: product.sku,
        }
      : {
          name: "",
          description: "",
          price: 0,
          stock: 0,
          category: "Makanan",
          sku: "",
        },
  });

  const category = watch("category");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Nama Produk</Label>
          <Input id="name" {...register("name")} placeholder="Nama produk" />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="col-span-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Input id="description" {...register("description")} placeholder="Deskripsi produk" />
        </div>

        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" {...register("sku")} placeholder="MKN-001" />
          {errors.sku && (
            <p className="text-sm text-destructive mt-1">{errors.sku.message}</p>
          )}
        </div>

        <div>
          <Label>Kategori</Label>
          <Select
            value={category}
            onValueChange={(v) => setValue("category", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="price">Harga (Rp)</Label>
          <Input id="price" type="number" min={0} {...register("price", { valueAsNumber: true })} />
          {errors.price && (
            <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="stock">Stok</Label>
          <Input id="stock" type="number" min={0} {...register("stock", { valueAsNumber: true })} />
          {errors.stock && (
            <p className="text-sm text-destructive mt-1">{errors.stock.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Menyimpan..." : product ? "Perbarui" : "Tambah Produk"}
        </Button>
      </div>
    </form>
  );
}
