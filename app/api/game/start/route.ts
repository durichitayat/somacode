import { sql } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function PATCH (request: Request) {
  const { email, gameid } = await request.json();
  try {
    console.log(`${email} Starting Game ${gameid}`);
    return NextResponse.json({message: `Game Started ${gameid}`}, {status: 200});
  }
  catch (error) {
    return NextResponse.json({error}, {status: 500});
  } 
}