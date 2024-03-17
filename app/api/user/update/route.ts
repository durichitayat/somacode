import { sql } from "@vercel/postgres";
import { NextResponse } from 'next/server';

{/***************
  * We can use this route to PATCH users.
  * Just hit the route from the browser or use a tool like Postman to send a PATCH to the route
  * INPUT: email
  ***************/}

  export async function POST (request: Request) {
    // JSON
    // const data = await request.json();
    // const email = data.email;
    // const status = data.status;
    // const image = data.image;
    // const name = data.name;
  
    // FormData
    const data = await request.formData();
    const email = data.get('email')?.toString();
    const image = data.get('image')?.toString();
    const name = data.get('name')?.toString();
  
    try {
        if (!email || email === null || email === undefined) {
            return NextResponse.json({ error: 'Missing email' }, { status: 400 });
        }
        if (name != null || name != undefined) {
            await sql`
                 WHERE email = ${email}`;
        }
        if (image != null || image != undefined) {
            await sql`
                UPDATE Users SET image = ${image} 
                UPDATE Users SET name = ${name}
                WHERE email = ${email}`;
        }
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({message:"User created"}, {status: 200});
  }