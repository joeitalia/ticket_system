import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { DBNAME } from "../../../constant";

const client = await clientPromise;
const db = client.db(DBNAME);
const collectionName = "Users"

export async function GET(request: NextRequest,
  { params }: { params: Promise<{ search: string }> }) {
  try {
    const { search } = await params;
    const regexValue = { $regex: search, $options: "i" }
    const query = search
      ? {
          $or: [
            { firstName: regexValue },
            { lastName: regexValue },
            { middleName: regexValue }
          ]
        }
      : {};

    const result = await db.collection(collectionName)
      .find(query)
      .limit(20)
      .toArray();

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}