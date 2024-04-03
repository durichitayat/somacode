import { sql } from "@vercel/postgres";
import { NextResponse } from 'next/server';

{/***************
  * This file is a route. It is a serverless function that runs in the cloud.'
  * We can use this route to create users.
  * Just hit the route from the browser or use a tool like Postman to send a POST to the route.
  ***************/}

export async function POST (request: Request) {

    console.log("request: ", request);  

    try {
        const { gameid, email, remove } = await request.json();
        console.log("gameid: ", gameid);
        console.log("email: ", email);
        console.log("remove: ", remove);
        if (remove) {
            const result = await sql`
                DELETE FROM Players
                WHERE GameID = ${gameid} AND email = ${email}`
            return NextResponse.json({result}, {status: 200});
        } else {
            const result = await sql`
                INSERT INTO Players (GameID, email) 
                VALUES (${gameid}, ${email})`
            return NextResponse.json({result}, {status: 200});
        }
    } catch (error) {
        return NextResponse.json({error}, {status: 500});
    }

}
