import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { DBNAME } from "../../constant";
import { hashText } from "@/util/hash";

const client = await clientPromise;
const db = client.db(DBNAME);
const collectionName = "Users"

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    const user = await db
      .collection(collectionName)
      .findOne({ resetToken: token });

    if (!user || user.resetTokenExpiry < Date.now()) {
      return NextResponse.json({ error: "Invalid or expired token" });
    }

    const hashedPassword = await hashText(password);

    await db.collection(collectionName).updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword }, $unset: { resetToken: "", resetTokenExpiry: "" } }
    );

    return NextResponse.json({ message: "Password updated" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}