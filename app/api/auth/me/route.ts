import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectToDatabase from "@/lib/db";
import Admin from "@/models/Admin";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.id;
    const role = payload.role as string;

    await connectToDatabase();
    
    let user;
    if (role === "admin") {
      user = await Admin.findById(userId).select("-password");
    } else {
      const SubAdmin = (await import("@/models/SubAdmin")).default;
      user = await SubAdmin.findById(userId).select("-password");
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check status for sub admins
    if (role === "subadmin" && user.status !== "active") {
      return NextResponse.json({ error: "Account inactive" }, { status: 403 });
    }

    return NextResponse.json({
      ...user.toObject(),
      role,
      username: user.username || user.name,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
