import {sql} from '@vercel/postgres';
import { NextResponse } from 'next/server';

{/***************
  * This file is a route. It is a serverless function that runs in the cloud.'
  * If for some reason we destroy the database or need to create a new one with the same schema (e.g. for testing), we can run this route to create the table(s) again.
  * Just hit the route from the browser or use a tool like Postman to send a GET request to the route.
  ***************/}
  
  export async function GET (request: Request) {
  
    try {
      // Then, create the table
      const table = 
          await sql`
          CREATE TABLE IF NOT EXISTS Characters (
            CharacterID SERIAL PRIMARY KEY,
            CharacterName VARCHAR(50) UNIQUE NOT NULL
          )
        `
      console.log({table}, {status: 200});
    } catch (error) {
        return NextResponse.json({error}, {status: 500});
    }
  
    try {
      // Then, insert the predefined data into the table
      const values = 
          await sql`
          INSERT INTO Characters (CharacterName) 
          VALUES ('Miss Scarlet'), ('Colonel Mustard'), ('Mrs. White'), ('Mr. Green'), ('Mrs. Peacock'), ('Professor Plum')
          ON CONFLICT (CharacterName) DO NOTHING
        `
      console.log({values}, {status: 200});
      return NextResponse.json({values}, {status: 200});
    } catch (error) {
        return NextResponse.json({error}, {status: 500});
    }
  }