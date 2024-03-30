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
          UserID UUID,
          FOREIGN KEY (UserID) REFERENCES Users(UserID),
          GameID UUID,
          FOREIGN KEY (GameID) REFERENCES Games(GameID),
          PlayerName VARCHAR(50),
          PlayerType VARCHAR(50),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `
    console.log({table}, {status: 200});
  } catch (error) {
      return NextResponse.json({error}, {status: 500});
  } 

  try {

    // Then, create the Rooms table
    const update = 
        await sql`
        ALTER TABLE Games
        ADD COLUMN CurrentTurn UUID,
        ADD FOREIGN KEY (CurrentTurn) REFERENCES Players(PlayerID),
        ADD COLUMN WinnerID UUID,
        ADD FOREIGN KEY (WinnerID) REFERENCES Players(PlayerID)
      `
    console.log({update}, {status: 200});
    return NextResponse.json({update}, {status: 200});
  } catch (error) {
      return NextResponse.json({error}, {status: 500});
  }

}
