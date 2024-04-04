import { sql } from "@vercel/postgres";
import { NextResponse } from 'next/server';

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

type GameRequestBody = {
    gameid: string;
    email: string;
    playerMove: string;
};

export async function POST (request: Request) {

    try {
        const { gameid, email, playerMove }: GameRequestBody = await request.json();
        console.log("gameid: ", gameid);
        console.log("email: ", email);
        console.log("playerMove: ", playerMove);
        if (email.toLowerCase() === "fetchstatus" && playerMove.toLowerCase() === "fetchstatus") {
            const { rows: turnCount } = await sql`SELECT turncount FROM Games WHERE gameid = ${gameid} LIMIT 1`;
            return NextResponse.json(turnCount[0].turncount, {status: 200});
        }
        const { rows: turnCount } = await sql`UPDATE Games
                                            SET turncount = turncount + 1
                                            WHERE gameid = ${gameid}
                                            RETURNING turncount`;
        let turnCountVal: number = turnCount[0].turncount
        let turnCountStr: string = turnCountVal.toString();
        return NextResponse.json(turnCountStr, {status: 200});
    } catch (error) {
        return NextResponse.json({error}, {status: 500});
    }

}