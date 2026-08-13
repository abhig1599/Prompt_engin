import { Client, Databases, Storage, ID } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID };

export const config = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
  collectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID || '',
  bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '',
};

