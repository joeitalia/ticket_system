import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { DBNAME } from "@/app/api/constant";

const client = await clientPromise;
const db = client.db(DBNAME);
const collectionName = "Comments";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;
    const result = await db
      .collection(collectionName)
      .find({ ticketId })
      .sort({ createdDate: 1 })
      .toArray();

    if (!result) {
      return NextResponse.json({ error: "Comments not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("MongoDB error:", error);
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;
    const data = await request.json();

    const result = await db.collection(collectionName).insertOne({ ...data, ticketId });
    return NextResponse.json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to insert data" }, { status: 500 });
  }
}