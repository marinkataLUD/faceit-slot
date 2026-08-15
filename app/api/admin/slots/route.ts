import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase, ADMIN_COOKIE } from "@/lib";

export async function GET() {
  const cookieStore = await cookies();

  if (cookieStore.get(ADMIN_COOKIE)?.value !== "1") {
    return NextResponse.json(
      { error: "Нямате достъп." },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("slot_controls")
    .select("hour,is_open")
    .order("hour", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    slots: data || [],
  });
}

export async function POST(req: Request) {
  const cookieStore = await cookies();

  if (cookieStore.get(ADMIN_COOKIE)?.value !== "1") {
    return NextResponse.json(
      { error: "Нямате достъп." },
      { status: 401 }
    );
  }

  try {
    const { hour, is_open } = await req.json();

    if (!hour || typeof is_open !== "boolean") {
      return NextResponse.json(
        { error: "Невалидни данни." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("slot_controls")
      .update({
        is_open,
        updated_at: new Date().toISOString(),
      })
      .eq("hour", hour);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Невалидна заявка." },
      { status: 400 }
    );
  }
}
