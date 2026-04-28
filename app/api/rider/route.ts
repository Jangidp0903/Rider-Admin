import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Rider from "@/models/Rider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { feId, fullName, phone } = body;

    /* ── Validation ───────────────────── */

    if (!feId || !fullName || !phone) {
      return NextResponse.json(
        { error: "feId, fullName, phone are required." },
        { status: 400 },
      );
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    /* ── Duplicate FE ID Check ───────── */

    const existing = await Rider.findOne({ feId });
    if (existing) {
      return NextResponse.json(
        { error: "FE ID already exists." },
        { status: 409 },
      );
    }

    /* ── 🔥 Daily Token Logic ───────── */

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // count today riders
    const todayCount = await Rider.countDocuments({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    const token = todayCount + 1;

    /* ── Create Rider ───────────────── */

    const newRider = await Rider.create({
      feId,
      fullName,
      phone,
      token,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Rider created successfully",
        data: newRider,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("RIDER_API_ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();

    const riders = await Rider.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: riders,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("RIDER_API_GET_ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching riders." },
      { status: 500 },
    );
  }
}
