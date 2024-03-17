import { sql } from "@vercel/postgres";
import { NextResponse } from 'next/server';

{/***************
    * We can use this route to CREATE users.
    * Just hit the route from the browser or use a tool like Postman to send a POST to the route
    * INPUT: email, image, name
    * OUTPUT: success message
    ***************/}

export async function POST (request: Request) {
    // FormData
    const data = await request.formData();
    console.log(data);

    const email = data.get('email')?.toString();
    const image = data.get('image')?.toString();
    const name = data.get('name')?.toString();
    const status = "active";

    console.log(email, image, name);

    try {
        await sql`
            INSERT INTO Users (email, image, name, status) VALUES 
            (${email}, ${image}, ${name}, ${status})
        `   
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({message:"User created"}, {status: 200});
}