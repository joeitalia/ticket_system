import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { DBNAME } from "../constant";

const client = await clientPromise;
const db = client.db(DBNAME);
const collectionName = "Tickets"

export async function GET(
  request: NextRequest,
) {
  try {
    const { searchParams } = new URL(request.url);

    const isReport = searchParams.get("report") === "true";

    const search = searchParams.get("search")?.trim();
    const searchBy = searchParams.get("searchBy")?.trim();

    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);

    const skip = (page - 1) * limit;

    const pipeline: any[] = [];

    // Date filter
    if (start && end) {
      pipeline.push({
        $match: {
          createdDate: {
            $gte: start,
            $lte: end,
          },
        },
      });
    }

    // Search filters
    if (search && searchBy) {
      const cleanSearch = search.trim();
      // =========================
      // ASSIGNEES SEARCH
      // =========================

      if (searchBy === "assignees") {
        pipeline.push({
          $addFields: {
            assigneeObjectIds: {
              $map: {
                input: "$assigneeIds",
                as: "id",
                in: { $toObjectId: "$$id" }
              }
            }
          }
        });

        pipeline.push({
          $lookup: {
            from: "Users",
            localField: "assigneeObjectIds",
            foreignField: "_id",
            as: "assigneeDetails",
          },
        });

        pipeline.push({ $unwind: "$assigneeDetails" });

        pipeline.push({
          $match: {
            $or: [
              {
                "assigneeDetails.firstName": {
                  $regex: cleanSearch,
                  $options: "i",
                },
              },
              {
                "assigneeDetails.lastName": {
                  $regex: cleanSearch,
                  $options: "i",
                },
              },
            ],
          },
        });
      }

      // =========================
      // CREATED BY SEARCH
      // =========================
      else if (searchBy === "createdBy") {
        pipeline.push({
          $addFields: {
            createdByObj: {
              $toObjectId: "$createdBy"
            }
          }
        });

        pipeline.push({
          $lookup: {
            from: "Users",
            localField: "createdByObj",
            foreignField: "_id",
            as: "creatorDetails",
          },
        });

        pipeline.push({
          $match: {
            $or: [
              {
                "creatorDetails.firstName": {
                  $regex: cleanSearch,
                  $options: "i",
                },
              },
              {
                "creatorDetails.lastName": {
                  $regex: cleanSearch,
                  $options: "i",
                },
              },
            ],
          },
        });
      }

      // =========================
      // NORMAL FIELD SEARCH
      // =========================
      else {
        pipeline.push({
          $match: {
            [searchBy]: {
              $regex: cleanSearch,
              $options: "i",
            },
          },
        });
      }
    }

    // Sort
    pipeline.push({
      $sort: {
        issueNo: -1,
      },
    });

    // Total count before pagination
    const totalPipeline = [...pipeline, { $count: "count" }];

    const totalResult = await db
      .collection(collectionName)
      .aggregate(totalPipeline)
      .toArray();

    const total = totalResult[0]?.count || 0;

    // ✅ Pagination only if NOT report
    if (!isReport) {
      pipeline.push(
        {
          $skip: skip,
        },
        {
          $limit: limit,
        }
      );
    }

    // Final query
    const tickets = await db
      .collection(collectionName)
      .aggregate(pipeline)
      .toArray();

    return NextResponse.json({
      data: tickets,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("API Error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch tickets",
      },
      {
        status: 500,
      }
    );
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