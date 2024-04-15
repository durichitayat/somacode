import {sql} from '@vercel/postgres';
import { NextResponse } from 'next/server';

{/***************
  * This file is a route. It is a serverless function that runs in the cloud.'
  * If for some reason we destroy the database or need to create a new one with the same schema (e.g. for testing), we can run this route to create the table(s) again.
  * Just hit the route from the browser or use a tool like Postman to send a GET request to the route.
  ***************/}

export async function GET (request: Request) {

  try {

    // Then, create the Rooms table
    const table = 
        await sql`
        CREATE TABLE IF NOT EXISTS Players (
          PlayerID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email VARCHAR(255),
          FOREIGN KEY (email) REFERENCES Users(email),
          GameID UUID,
          FOREIGN KEY (GameID) REFERENCES Games(GameID),
          Winner BOOLEAN,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          TurnOrder INT,
          XCoord INT,
          YCoord INT,
          cards TEXT[][],
          character VARCHAR(50),
          Active BOOLEAN
        )
      `
    console.log({table}, {status: 200});
    return NextResponse.json({table}, {status: 200});
  } catch (error) {
      return NextResponse.json({error}, {status: 500});
  } 
}
