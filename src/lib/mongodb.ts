import { MongoClient } from "mongodb";

let uri = ""
if (process.env.NODE_ENV === "development") {
  const HOST = process.env.MONGO_HOST
  const PORT = process.env.MONGO_PORT
  const DATABASE = process.env.DATABASE_NAME
  uri = process.env.MONGODB_URI || `mongodb://${HOST}:${PORT}/${DATABASE}`
} else {
  uri = process.env.MONGODB_URI || ""
}
const options = {};

if (!uri) {
  throw new Error("Please add your Mongo URI to .env.local");
}

// Declare global type for TypeScript
declare global {
  var _mongoClientPromise: ReturnType<typeof client.connect> | undefined;
}

let client: any
let clientPromise: ReturnType<typeof client.connect> | undefined;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;