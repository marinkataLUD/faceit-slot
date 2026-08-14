import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("bookings")
      .select("hour,name,created_at")
      .order("hour", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ bookings: data || [] });
  }

  if (req.method === "POST") {
    const { hour, name } = req.body || {};
    if (!hour || !name || typeof name !== "string")
      return res.status(400).json({ error: "Невалидни данни." });

    const { count, error: countError } = await supabase
      .from("bookings").select("*", { count: "exact", head: true });

    if (countError) return res.status(500).json({ error: countError.message });
    if ((count || 0) >= 4) return res.status(409).json({ error: "Всички 4 слота са запазени." });

    const { data: existing } = await supabase
      .from("bookings").select("hour").eq("hour", hour).maybeSingle();

    if (existing) return res.status(409).json({ error: "Този час вече е запазен." });

    const { error } = await supabase.from("bookings").insert({
      hour, name: name.trim().slice(0, 30)
    });

    if (error) {
      if (error.code === "23505") return res.status(409).json({ error: "Този час вече е запазен." });
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}