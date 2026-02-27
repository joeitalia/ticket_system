import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { DBNAME } from "@/app/api/constant";

const client = await clientPromise;
const db = client.db(DBNAME);
const collectionName = "Tickets"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Convert to ObjectId if needed
    const { id } = await params;

    // Query: all tickets with matching departmentId
    const tickets = await db
      .collection(collectionName)
      .find({ departmentId: id })
      .sort({ issueNo: -1 }) // -1 means descending
      .toArray();

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}