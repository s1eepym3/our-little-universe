"use server";

import { revalidatePath } from "next/cache";

export async function triggerRevalidate() {
  revalidatePath("/");
  revalidatePath("/moments");
  revalidatePath("/ruang-kita");
  revalidatePath("/ruang-kita/catatan");
  revalidatePath("/ruang-kita/kelola");
}
