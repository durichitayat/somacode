import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/game/move
export async function PATCH (req: Request) {
    try {
      console.log("POST /api/game/move/route.ts");
      const { gameid, email, y, x }  = await req.json();

      // Update player's coordinates
      await sql`UPDATE Players SET xcoord = ${x}, ycoord = ${y} WHERE email = ${email} AND gameid = ${gameid}`;
      turnCount(gameid);

      return NextResponse.json({ message: `${email} moved to y:${y}, x:${x}` }, {status: 200});
    } catch (error) {
      return NextResponse.json({ message: error }, {status: 500});
    }
}


async function turnCount(gameid: string): Promise<void> {

  try {
    
    await sql`
      UPDATE Games
      SET turncount = turncount + 1
      WHERE gameid = ${gameid}`
    
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }

}