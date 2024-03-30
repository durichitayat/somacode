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

      // Then, create the table with the new column
      const result = 
          await sql`
          CREATE TABLE IF NOT EXISTS Games (
            GameID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            
            MurdererID INT, 
            FOREIGN KEY (MurdererID) REFERENCES Characters(CharacterID),

            MurderWeaponID INT,
            FOREIGN KEY (MurderWeaponID) REFERENCES Weapons(WeaponID),

            MurderRoomID INT, 
            FOREIGN KEY (MurderRoomID) REFERENCES Rooms(RoomID),

            GameState VARCHAR(50),
            StartTime TIMESTAMP,
            EndTime TIMESTAMP,
            TurnCount INT,
            SolutionRevealed BOOLEAN,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `
      return NextResponse.json({result}, {status: 200});
    } catch (error) {
        return NextResponse.json({error}, {status: 500});
    }
}