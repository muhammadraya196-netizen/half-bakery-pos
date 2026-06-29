import { z } from "zod";

const roleEnum = z.enum(["admin", "finance", "cashier"], {
  message: "Role wajib dipilih",
});
const statusEnum = z.enum(["active", "inactive"], {
  message: "Status wajib dipilih",
});

const baseUserFields = {
  name: z.string().min(1, "Nama wajib diisi").max(100),
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(30)
    .regex(/^[a-zA-Z0-9._-]+$/, "Username hanya huruf, angka, . _ -"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]*$/, "Nomor HP tidak valid")
    .optional()
    .or(z.literal("")),
  role: roleEnum,
  status: statusEnum,
  avatar: z.string().optional().or(z.literal("")),
};

/** Skema tambah user (password wajib). */
export const createUserSchema = z
  .object({
    ...baseUserFields,
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Password dan konfirmasi tidak sama",
    path: ["confirmPassword"],
  });

/** Skema edit user (password opsional; bila diisi minimal 8 & harus cocok). */
export const editUserSchema = z
  .object({
    ...baseUserFields,
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .optional()
      .or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
  })
  .refine(
    (d) => !d.password || d.password === d.confirmPassword,
    {
      message: "Password dan konfirmasi tidak sama",
      path: ["confirmPassword"],
    }
  );

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type EditUserFormData = z.infer<typeof editUserSchema>;
