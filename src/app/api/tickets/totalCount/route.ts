import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { DBNAME } from "../../constant";

const client = await clientPromise;
const db = client.db(DBNAME);
const collectionName = "Tickets"

export async function GET() {
  try {
    const totalRecords = await db.collection(collectionName).countDocuments();
    return NextResponse.json({returnValue: totalRecords});
  } catch (error: any) {
    console.error("MongoDB error:", error);
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }
}