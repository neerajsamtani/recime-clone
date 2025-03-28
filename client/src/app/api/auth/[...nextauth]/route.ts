import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers: { GET, POST } } = NextAuth(async (req) => {
    console.log(req) // do something with the request
    return {
        providers: [
            Google({
                clientId: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            }),
        ],
        session: {
            strategy: "jwt",
        },
        pages: {
            signIn: "/login",
        },
        debug: process.env.NODE_ENV === "development",
        callbacks: {
            async session({ session, token }) {
                if (session.user) {
                    session.user.id = token.sub!;
                }
                return session;
            },
        },
    };
});
