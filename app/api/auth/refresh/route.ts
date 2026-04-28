import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/db";
import Admin from "@/models/Admin";
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token provided" }, { status: 401 });
    }

    const decoded: any = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    await connectToDatabase();
    const admin = await Admin.findById(decoded.id);

    if (!admin || admin.refreshToken !== refreshToken) {
      return NextResponse.json({ error: "Token revoked or invalid" }, { status: 401 });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken({ id: admin._id, email: admin.email, username: admin.username });
    const newRefreshToken = generateRefreshToken({ id: admin._id });

    // Update DB
    admin.refreshToken = newRefreshToken;
    await admin.save();

    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: "token",
      value: newAccessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/",
    });

    response.cookies.set({
      name: "refreshToken",
      value: newRefreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
