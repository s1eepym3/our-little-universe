import { createClient } from "@/lib/supabase/server";
import { Moment, Note } from "@/types/database";
import KelolaDesk from "./KelolaDesk";

export const dynamic = "force-dynamic";

export default async function KelolaPage() {
  const supabase = await createClient();

  // Fetch all moments (both public and private)
  const { data: moments } = await supabase
    .from("moments")
    .select("*, media(*)")
    .order("created_at", { ascending: false });

  // Fetch all notes
  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <KelolaDesk
      initialMoments={(moments as Moment[]) || []}
      initialNotes={(notes as Note[]) || []}
    />
  );
}
