import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase, ADMIN_COOKIE, PERMANENT } from "@/lib";

export async function POST(req: Request) {
  const cookieStore = await cookies();

  if (cookieStore.get(ADMIN_COOKIE)?.value !== "1") {
    return NextResponse.json(
      { error: "Нямате достъп." },
      { status: 401 }
    );
  }

  const { id, hour } = await req.json();

  if (!id && !hour) {
    return NextResponse.json(
      { error: "Липсва играч или час." },
      { status: 400 }
    );
  }

  // Permanent слотът не може да бъде премахнат
  if (hour === PERMANENT.hour) {
    return NextResponse.json(
      { error: "Permanent слотът не може да бъде премахнат." },
      { status: 400 }
    );
  }

  // Ако е подадено ID -> изтриваме само конкретния играч
  if (id) {
    const { error } = await supabase
      .from("faceit_players")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  }

  // Старият начин: ако е подаден само час,
  // изтриваме всички играчи за този час.
  const { error } = await supabase
    .from("faceit_players")
    .delete()
    .eq("hour", hour);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
