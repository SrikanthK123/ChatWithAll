import { Client, Account,Databases,Storage,Permission,Role} from 'appwrite';

export const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(import.meta.env.VITE_PROJECT_ID_2); // Replace with your project ID

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const permission = new Permission(client);
export const role = new Role(client);

export { ID } from 'appwrite';
