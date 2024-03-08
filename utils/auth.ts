import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

export const authOptions: any = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (credentials == null) return null;
        const user = await prisma.user.findFirst({
          where: {
            username: credentials.username,
          },
        });

        if (
          !user ||
          !(await bcrypt.compare(credentials.password, user.password))
        ) {
          throw new Error("Invalid username or password");
        }

        return user;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }: any) => {
      if (user) {
        token.user_id = user.id;
        token.username = user.username;
      }
      return Promise.resolve(token);
    },
    session: async ({ session, token }: any) => {
      if (token) {
        session.user.id = token.user_id;
        session.user.username = token.username;
      }
      return Promise.resolve(session);
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
};

export const getAuthSession = () => getServerSession(authOptions);
