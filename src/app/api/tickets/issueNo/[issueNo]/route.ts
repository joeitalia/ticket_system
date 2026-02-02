import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { DBNAME } from "@/app/api/constant";

const client = await clientPromise;
const db = client.db(DBNAME);
const collectionName = "Tickets"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ issueNo: string }> }
) {
  try {
    const { issueNo: issueNoStr } = await params;
    const issueNo = parseInt(issueNoStr)
    const result: any = await db
      .collection(collectionName)
      .findOne({ issueNo });
    
      if (!result) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("MongoDB error:", error);
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }
}