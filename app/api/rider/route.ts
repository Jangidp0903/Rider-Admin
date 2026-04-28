import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Rider from "@/models/Rider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { feId, fullName, phone } = body;

    if (!feId || !fullName || !phone) {
      return NextResponse.json(
        { error: "feId, fullName, phone are required." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    /* ✅ TODAY RANGE (with time) */
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    /* 🔍 Find today's entries of same FE */
    const todayEntries = await Rider.find({
      phone,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ createdAt: 1 });

    /* ───────── CASE 3: Already 2 entries → BLOCK ───────── */
    if (todayEntries.length >= 2) {
      return NextResponse.json(
        { error: "You have already checked in & out today." },
        { status: 400 },
      );
    }

    /* ───────── CASE 2: Second entry → CHECK OUT ───────── */
    if (todayEntries.length === 1) {
      const existing = todayEntries[0];

      const checkoutEntry = await Rider.create({
        feId,
        fullName,
        phone,
        token: existing.token,
        status: "checked-out",
      });

      return NextResponse.json({
        success: true,
        message: "Checked out successfully",
        data: checkoutEntry,
      });
    }

    /* ───────── CASE 1: First entry → CHECK IN ───────── */

    const todayCount = await Rider.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: "checked-in", // important
    });

    const token = todayCount + 1;

    const checkinEntry = await Rider.create({
      feId,
      fullName,
      phone,
      token,
      status: "checked-in",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Checked in successfully",
        data: checkinEntry,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("API ERROR:", error);

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
