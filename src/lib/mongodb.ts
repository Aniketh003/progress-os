import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  minPoolSize: 0,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000,
};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (uri) {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect().catch((err) => {
        global._mongoClientPromise = undefined;
        throw err;
      });
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  console.warn('ProgressOS: MONGODB_URI is not defined. Cloud DB features will be inactive until configured.');
}

export async function getDatabase(): Promise<Db | null> {
  if (!uri) return null;

  try {
    if (!clientPromise) {
      client = new MongoClient(uri, options);
      clientPromise = client.connect();
      if (process.env.NODE_ENV === 'development') {
        global._mongoClientPromise = clientPromise;
      }
    }
    const connectedClient = await clientPromise;
    return connectedClient.db(process.env.MONGODB_DB_NAME || 'progressos');
  } catch (error) {
    // Reset cached promise so subsequent requests can re-attempt connection
    clientPromise = null;
    if (process.env.NODE_ENV === 'development') {
      global._mongoClientPromise = undefined;
    }
    throw error;
  }
}

export default clientPromise;
