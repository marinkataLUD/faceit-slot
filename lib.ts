import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export const HOURS = Array.from({ length: 14 }, (_, i) => {
  const h = 10 + i;
  return `${String(h).padStart(2, "0")}:00`;
});

export const PERMANENT = {
  hour: "01:00 - 10:00",
  name: "MagicSlien_",
};

export const MAX_BOOKINGS = 4;
export const ADMIN_COOKIE = "faceit_admin";

export function hourRange(start: string) {
  const h = Number(start.slice(0, 2));
  const next = (h + 1) % 24;
  return `${start} - ${String(next).padStart(2, "0")}:00`;
}