import crypto from "crypto";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { DBNAME } from "@/app/api/constant";
// import { sendResetEmail } from "@/util/send-email";

const client = await clientPromise;
const db = client.db(DBNAME);
const collectionName = "Users";

export async function POST(req: Request) {
  const { email } = await req.json();
  const host = req.headers.get("host");
  const protocol = process.env.NODE_ENV === "development"
    ? "http"
    : "https";
  const origin = `${protocol}://${host}`;
  try {
    const result = await db
      .collection(collectionName)
      .findOne({ email });
    if (!result || !result._id) {
      return NextResponse.json({ message: "Email not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 1000 * 60 * 15; // 15 minutes

    await saveResetToken(result._id, resetToken, expiry);
    const resetLink = `${origin}/forgot-password/reset-password?token=${resetToken}`;
  
    return NextResponse.json({ resetLink }, { status: 200 });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return NextResponse.json({ message: "Error sending reset email" }, { status: 500 });
  }
}

const saveResetToken = async (userId: any, token: string, expiry: number) => {
  await db.collection(collectionName).updateOne(
    { _id: userId },
    { $set: { resetToken: token, resetTokenExpiry: expiry } }
  );
};