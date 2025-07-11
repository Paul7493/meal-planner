import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: MongooseConnection | null = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null
  };
}

async function dbConnect(): Promise<typeof mongoose | null> {
  if (!cached) return null;
  
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    try {
      if (!MONGODB_URI) {
        console.warn('MongoDB URI not found. Using mock data for development.');
        return null;
      }

      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log('Connected to MongoDB');
        return mongoose;
      });
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      return null;
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    console.error('Error establishing MongoDB connection:', error);
    cached.promise = null;
    return null;
  }

  return cached.conn;
}

export default dbConnect;
