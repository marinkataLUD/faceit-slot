import { NextResponse } from "next/server";
import { supabase } from "@/lib";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Липсва ID." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("premium_bookings")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Невалидна заявка." },
      { status: 400 }
    );
  }
}
