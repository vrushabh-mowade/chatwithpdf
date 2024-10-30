import {neon} from '@neondatabase/serverless';
import {drizzle} from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';

dotenv.config();


if(!process.env.DATABASE_URL){
    throw new Error("database url not found")
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql);
