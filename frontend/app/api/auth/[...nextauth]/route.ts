// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// Define a type that extends the User type but makes token optional
interface CustomUser {
  id: string;
  name: string;
  email: string;
  token?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // For testing purposes
          if (credentials.email === "test@example.com" && credentials.password === "password") {
            return {
              id: "1",
              name: "Test User",
              email: "test@example.com",
              token: "mock-token" // Add this to satisfy the type requirement
            } as any; // Use type assertion to bypass strict typing
          }
          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Store the token if it exists
        if ((user as CustomUser).token) {
          token.userToken = (user as CustomUser).token;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        // Add token to session if needed
        (session as any).token = token.userToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    newUser: '/signup',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-key',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };