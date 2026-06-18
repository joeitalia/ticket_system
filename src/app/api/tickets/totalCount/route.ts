import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { DBNAME } from "../../constant";

const client = await clientPromise;
const db = client.db(DBNAME);
const collectionName = "Tickets";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeStatuses =
      searchParams.get("showStatus") === "true";

    const totalRecords = await db
      .collection(collectionName)
      .countDocuments();

    const response: any = {
      totalRecords,
    };

    if (includeStatuses) {
      const statusCounts = await db
        .collection(collectionName)
        .aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ])
        .toArray();

      response.statusCounts = statusCounts;
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("MongoDB error:", error);
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }
}