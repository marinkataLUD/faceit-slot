import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase, ADMIN_COOKIE, PERMANENT } from "@/lib";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get(ADMIN_COOKIE)?.value !== "1")
    return NextResponse.json({ error: "Нямате достъп." }, { status: 401 });

  const { hour } = await req.json();
  if (!hour || hour === PERMANENT.hour) return NextResponse.json({ error: "Permanent слотът не може да бъде премахнат." }, { status: 400 });

  const { error } = await supabase.from("bookings").delete().eq("hour", hour);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}