import { Client, Account, Databases, Storage } from 'appwrite';

// Client-side Appwrite setup
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
  collections: {
    resources: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_RESOURCES || '',
    promptDetails: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROMPTS || '',
    siteDetails: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SITES || '',
    categories: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CATEGORIES || '',
    tags: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TAGS || '',
  },
  storage: {
    images: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_IMAGES || '',
  }
};
