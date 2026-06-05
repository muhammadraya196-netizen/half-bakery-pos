import { z } from "zod";
import { CATEGORIES } from "@/lib/mock-data";

export const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi").max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0, "Harga tidak boleh negatif"),
  stock: z.number().int().min(0, "Stok tidak boleh negatif"),
  category: z.enum(CATEGORIES as unknown as [string, ...string[]], {
    message: "Kategori wajib dipilih",
  }),
  sku: z.string().min(1, "SKU wajib diisi").max(20),
});

export type ProductFormData = z.infer<typeof productSchema>;
