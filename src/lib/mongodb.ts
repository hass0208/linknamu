import { MongoClient, type Collection } from "mongodb";

export interface ClickDoc {
  linkId: string;
  count: number;
}

const DB_NAME = "linknamu";
const COLLECTION_NAME = "clicks";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> | null {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null;
  }

  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }

  return global._mongoClientPromise;
}

async function getClicksCollection(): Promise<Collection<ClickDoc> | null> {
  const clientPromise = getClientPromise();
  if (!clientPromise) {
    console.error("MONGODB_URI가 설정되지 않아 클릭 집계를 건너뜁니다.");
    return null;
  }

  try {
    const client = await clientPromise;
    return client.db(DB_NAME).collection<ClickDoc>(COLLECTION_NAME);
  } catch (error) {
    console.error("MongoDB 연결 실패:", error);
    return null;
  }
}

export async function incrementClick(linkId: string): Promise<void> {
  const collection = await getClicksCollection();
  if (!collection) {
    return;
  }

  try {
    await collection.updateOne(
      { linkId },
      { $inc: { count: 1 } },
      { upsert: true },
    );
  } catch (error) {
    console.error(`클릭 집계 실패 (linkId=${linkId}):`, error);
  }
}

export async function getAllClickCounts(): Promise<Record<string, number>> {
  const collection = await getClicksCollection();
  if (!collection) {
    return {};
  }

  try {
    const docs = await collection.find().toArray();
    return Object.fromEntries(docs.map((doc) => [doc.linkId, doc.count]));
  } catch (error) {
    console.error("클릭 수 조회 실패:", error);
    return {};
  }
}
