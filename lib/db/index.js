import { MongoClient } from "mongodb";
import { getSecrets } from "../secrets.js";

const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

let cachedClient;

const connect = async (retries = 5) => {
  if (cachedClient) {
    return cachedClient;
  }
  const { MONGODB_URI } = await getSecrets();
  while (retries--) {
    try {
      const connection = new MongoClient(MONGODB_URI, options);
      const client = await connection.connect();
      cachedClient = client;
      return client;
    } catch (error) {
      if (!retries) {
        throw error;
      }
    }
  }
};

export const getDB = async () => {
  const client = await connect();
  const { DB_NAME } = await getSecrets();
  return client.db(DB_NAME);
};

export const getRpc = async (project) => {
  const db = await getDB();
  const collection = db.collection("smartRpc");

  const rpc = await collection.findOne({ project, calls: { $gt: 0 } });

  return rpc;
};

export const chargeRpc = async (rpc, failed) => {
  const db = await getDB();
  const collection = db.collection("smartRpc");

  await collection.updateOne(
    { _id: rpc._id },
    { $inc: { calls: failed ? -1 : -20 } }
  );
};
