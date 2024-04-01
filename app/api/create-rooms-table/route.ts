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
        CREATE TABLE IF NOT EXISTS Rooms (
          RoomID SERIAL PRIMARY KEY,
          RoomName VARCHAR(50) UNIQUE NOT NULL
        )
      `
    console.log({table}, {status: 200});
  } catch (error) {
      return NextResponse.json({error}, {status: 500});
  }

  try {
    // Then, insert the predefined rooms into the Rooms table
    const rooms = 
        await sql`
        INSERT INTO Rooms (RoomName) 
        VALUES ('Kitchen'), ('Ballroom'), ('Conservatory'), ('Dining Room'), ('Cellar'), ('Billiard Room'), ('Library'), ('Lounge'), ('Hall'), ('Study')
        ON CONFLICT (RoomName) DO NOTHING
      `
    console.log({rooms}, {status: 200});
    return NextResponse.json({rooms}, {status: 200});
  } catch (error) {
      return NextResponse.json({error}, {status: 500});
  }
}