import { Client, Account, Databases } from 'appwrite';

const client = new Client();

const endpoint = process.env.REACT_APP_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.REACT_APP_APPWRITE_PROJECT_ID;

if (!projectId) {
  console.warn("Appwrite Project ID must be defined in the .env.local file");
} else {
  client
    .setEndpoint(endpoint)
    .setProject(projectId);
}

export const account = new Account(client);
export const databases = new Databases(client);
export default client;
