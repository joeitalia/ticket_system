import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { DBNAME } from "../../../constant";

const client = await clientPromise;
const db = client.db(DBNAME);
const collectionName = "Users"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ department: string }> }
) {
  try {
    const { department } = await params;
    const user: any = await db
      .collection(collectionName)
      .find(
        { departmentId: department },
        { projection: { password: 0 } }
      )
      .toArray();
    
    return NextResponse.json({success: true, data: user});
  } catch (error) {
    console.error("MongoDB error:", error);
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }
}