import { sql } from "@vercel/postgres";
import { NextResponse } from 'next/server';

{/***************
  * This file is a route. It is a serverless function that runs in the cloud.'
  * We can use this route to create users.
  * Just hit the route from the browser or use a tool like Postman to send a POST to the route.
  ***************/}

export async function POST (request: Request) {

  /**
   * @todo: randomize the murderer, weapon, and room
   */
  const murdererID = 1;
  const murderWeaponID = 1;
  const murderRoomID = 1;
  const gameState = 'open';

  try {
    const { username } = await request.json();
    const result = await sql`
      INSERT INTO Games (
        MurdererID, 
        MurderWeaponID, 
        MurderRoomID, 
        GameState, 
        StartTime, 
        EndTime, 
        TurnCount, 
        SolutionRevealed
      ) 
      VALUES (
        ${murdererID}, 
        ${murderWeaponID}, 
        ${murderRoomID}, 
        ${gameState}, 
        NOW(), 
        NULL, 
        0, 
        FALSE
      )
      RETURNING *
    `;

    const gameID = result.rows[0].gameid
    return NextResponse.json({message: gameID}, {status: 200});
  }
  catch (error) {
    return NextResponse.json({error}, {status: 500});
  } 
}

export async function GET (request: Request) {
  return NextResponse.json({message: 'Hello from lobby GET'}, {status: 200});
}