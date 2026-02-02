import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { DBNAME } from "../../constant";
import { ObjectId } from "mongodb";

const client = await clientPromise;
const db = client.db(DBNAME);
const collectionName = "Departments"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const department = await db
      .collection(collectionName)
      .findOne({ _id: new ObjectId(id) });

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    return NextResponse.json({success: true, data: department});
  } catch (error) {
    console.error("MongoDB error:", error);
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.collection(collectionName).deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Department deleted successfully" });
  } catch (error) {
    console.error("MongoDB delete error:", error);
    return NextResponse.json({ error: "Failed to delete Department" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await db.collection(collectionName).updateOne(
      { _id: new ObjectId(id) },
      { $set: body }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Department updated successfully",
    });
  } catch (error) {
    console.error("MongoDB update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}