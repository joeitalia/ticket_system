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
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') ?? '') ?? 1
    const limit = parseInt(searchParams.get('limit') ?? '') ?? 10

    const skip = (page - 1) * limit;
    
    // Query: all tickets with matching departmentId
    const query = { departmentId: id }
    const collection = db.collection(collectionName)
    const tickets = await collection
      .find(query)
      .sort({ issueNo: -1 }) // -1 means descending
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await collection.countDocuments(query);

    return NextResponse.json({
      data: tickets,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}