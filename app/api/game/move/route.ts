import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from 'next/server';

// PUT
export async function PATCH (req: Request) {
    try {
      console.log("POST /api/game/move/route.ts");
      const { gameid, email, y, x }  = await req.json();

      // Update player's coordinates
      await sql`UPDATE Players SET xcoord = ${x}, ycoord = ${y} WHERE email = ${email} AND gameid = ${gameid}`;
  
      return NextResponse.json({ message: "message" }, {status: 200});
    } catch (error) {
      return NextResponse.json({ error: error }, {status: 500});
    }
}