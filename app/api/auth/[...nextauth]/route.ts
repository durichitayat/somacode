import NextAuth, { User, Account, Profile } from "next-auth";
import { sql } from "@vercel/postgres";
import GitHubProvider from "next-auth/providers/github";

interface SignInParams {
    user: User | Account;
    account: Account | null;
    profile?: Profile;
    email?: { verificationRequest?: boolean };
    credentials?: Record<string, any>;
  }

const authOptions = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID ?? "",
            clientSecret: process.env.GITHUB_SECRET ?? "",
        }),
    ],
    callbacks: {
        async signIn({user}: SignInParams) {
            console.log('User: ', user);
            
            const email = user.email as string;
            const image = user.image as string;
            const name = user.name as string;

            const existingUser = await sql`SELECT * FROM Users WHERE email = ${email}`;
            if (existingUser.rows.length === 0) {
                await sql`
                    INSERT INTO Users (email, name, image, status)
                    VALUES (${email}, ${name}, ${image}, 'active')
                `;
            }

            return true;
        },
    },
};

const handler = NextAuth(authOptions);

export const GET = handler;
export const POST = handler;

