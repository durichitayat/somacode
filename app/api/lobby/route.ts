import { sql } from "@vercel/postgres";
import { NextResponse } from 'next/server';

{/***************
  * This file is a route. It is a serverless function that runs in the cloud.'
  * We can use this route to create users.
  * Just hit the route from the browser or use a tool like Postman to send a POST to the route.
  ***************/}

export async function POST (request: Request) {
  const { searchParams } = new URL(request.url);
  const lobbyID = searchParams.get('lobby');

//   try {
//     if (!lobbyID) {
//         return NextResponse.json({error: 'Missing lobby id'}, {status: 400});
//     }
//     // TODO query into database to fetch the lobby here
//   } catch (error) {
//     return NextResponse.json({error}, {status: 500});
//   }

  return NextResponse.json({message: 'Hello from lobby POST'}, {status: 200});
}

export async function GET (request: Request) {
    return NextResponse.json({message: 'Hello from lobby GET'}, {status: 200});
  }