import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { DBNAME } from "@/app/api/constant";

const client = await clientPromise;
const db = client.db(DBNAME);

const collectionName = "Tickets";

