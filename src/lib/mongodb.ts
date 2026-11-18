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
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR.
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  // In environments where MONGODB_URI is not yet provided (e.g., initial build or guest mode),
  // we do not fail at build time.
  console.warn('ProgressOS: MONGODB_URI is not defined. Cloud DB features will be inactive until configured.');
}

export async function getDatabase(): Promise<Db | null> {
  if (!clientPromise) return null;
  const connectedClient = await clientPromise;
  return connectedClient.db(process.env.MONGODB_DB_NAME || 'progressos');
}

export default clientPromise;
