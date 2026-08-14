import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase, ADMIN_COOKIE } from "@/lib";

export async function POST() {
  const cookieStore = await cookies();
  if (cookieStore.get(ADMIN_COOKIE)?.value !== "1")
    return NextResponse.json({ error: "Нямате достъп." }, { status: 401 });

  const { error } = await supabase.from("bookings").delete().neq("hour", "__never__");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}