import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const authOptions = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID ?? "",
            clientSecret: process.env.GITHUB_SECRET ?? "",
        }),
    ],
};

const handler = NextAuth(authOptions);

export const GET = handler;
export const POST = handler;

