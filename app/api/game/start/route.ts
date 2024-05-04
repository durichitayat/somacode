import { sql } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function PATCH (request: Request) {
  const { email, gameName } = await request.json();
  
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