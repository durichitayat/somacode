import {sql} from '@vercel/postgres';
import { NextResponse } from 'next/server';

{/***************
  * This file is a route. It is a serverless function that runs in the cloud.'
  * If for some reason we destroy the database or need to create a new one with the same schema (e.g. for testing), we can run this route to create the table(s) again.
  * Just hit the route from the browser or use a tool like Postman to send a GET request to the route.
  ***************/}

export async function GET (request: Request) {

  try {
    // First, ensure the "uuid-ossp" extension is enabled
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Then, create the Weapons table
    const table = 
        await sql`
        CREATE TABLE IF NOT EXISTS Weapons (
          WeaponID SERIAL PRIMARY KEY,
          WeaponName VARCHAR(50) UNIQUE NOT NULL
        )
      `
    console.log({table}, {status: 200});
  } catch (error) {
      return NextResponse.json({error}, {status: 500});
  }

  try {
    // Then, insert the predefined weapons into the Weapons table
    const weapons = 
        await sql`
        INSERT INTO Weapons (WeaponName) 
        VALUES ('Candlestick'), ('Knife'), ('Lead Pipe'), ('Revolver'), ('Rope'), ('Wrench')
        ON CONFLICT (WeaponName) DO NOTHING
      `
    console.log({weapons}, {status: 200});
    return NextResponse.json({weapons}, {status: 200});
  } catch (error) {
      return NextResponse.json({error}, {status: 500});
  }
}