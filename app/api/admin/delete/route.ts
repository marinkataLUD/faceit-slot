import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase, ADMIN_COOKIE } from "@/lib";

export async function POST(req: Request) {
  const cookieStore = await cookies();

  if (cookieStore.get(ADMIN_COOKIE)?.value !== "1") {
    return NextResponse.json(
      { error: "Нямате достъп." },
      { status: 401 }
    );
  }

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Липсва ID на играча." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Невалидна заявка." },
      { status: 400 }
    );
  }
}
