// Works in Node.js, Next.js, serverless, and edge runtimes
import { neon } from '@neondatabase/serverless';

export async function POST(request: Request, ) {
    const sql = neon(process.env.DATABASE_URL!);

    const { clerkId, email, firstName, lastName, avatarUrl, role } = await request.json();

    if (!firstName || !email || !clerkId) {
        return Response.json(
            {error: "Missing Required Fields",},
            {status: 400}
        )
    }
    try {
        const response = await sql`
            INSERT INTO users (
                email, clerk_id, first_name, last_name, avatar_url, role
            ) VALUES (
                ${email}, ${clerkId}, ${firstName}, ${lastName}, ${avatarUrl}, ${role}
            )
        `;

        return new Response(
            JSON.stringify({ data: response }),
            { status: 201 }
        )
    } catch (error) {
        console.error(error);
        return Response.json(
            { error: error },
            { status: 500 }
        )
    }
}