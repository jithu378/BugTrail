import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(uri = env.mongoUri) {
  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });

  if (!env.isTest) {
    const { host, name } = mongoose.connection;
    console.log(`MongoDB connected: ${host}/${name}`);
  }

  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
