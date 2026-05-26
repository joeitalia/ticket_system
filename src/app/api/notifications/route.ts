import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { DBNAME } from "../constant";

const client = await clientPromise;
const db = client.db(DBNAME);
const collectionName = "Notifications"

export async function GET() {
  try {
    const notifications = await db.collection(collectionName).find({}).toArray();
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("MongoDB error:", error);
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const result = await db.collection(collectionName).insertOne(data);
    return NextResponse.json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to insert data" }, { status: 500 });
  }
}