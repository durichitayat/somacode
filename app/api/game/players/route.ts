import { sql } from "@vercel/postgres";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from 'next/server';

{/***************
  * This is more of a proof of concept than anything.
  * Page updates every 5 seconds by sending a "fetchstatus" POST to this API.
  * API then returns the turncount.
  * This turncount can be incremented by any player sending anything in the chatbox.
  * This shows that the text-based Clueless game can be seamlessly updated and demonstrates how to interact with the API.
  * 
  * As a reminder, our APIs are REST so we don't save state other than in the database.
  * So every call to this API must contain the gameid, email (user intentifier), and playerMove (gives insight into the player's move)
  ***************/}

// GET
export async function GET (req: Request) {
  try {
    console.log("GET request received.");
    const url = new URL(req.url);
    const gameid = url.searchParams.get('gameid');
    if (!gameid) {
      return NextResponse.json({ result: "" }, {status: 400})
    }

    const { rows: players } = await sql`SELECT * FROM Players WHERE gameid = ${gameid}`;

    return NextResponse.json({ players, gameid }, {status: 200});
  } catch (error) {
    return NextResponse.json({ error: error }, {status: 500});
  }
}