import { sql } from "@vercel/postgres";
import { NextResponse } from 'next/server';

{/***************
  * This file is a route. It is a serverless function that runs in the cloud.'
  * We can use this route to create users.
  * Just hit the route from the browser or use a tool like Postman to send a POST to the route.
  ***************/}

export async function POST (request: Request) {

  const { email, gameName } = await request.json();

  /**
   * @todo: randomize the murderer, weapon, and room
   */
  const murdererID = 1;
  const murderWeaponID = 1;
  const murderRoomID = 1;
  const gameState = 'open';

  try {
    const result = await sql`
      INSERT INTO Games (
        GameName,
        GameOwner,
        GameState, 
        StartTime, 
        EndTime, 
        CurrentTurn,
        SolutionRevealed
      ) 
      VALUES (
        ${gameName},
        ${email},
        ${gameState}, 
        NOW(), 
        NULL, 
        1,
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