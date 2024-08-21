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

        // Find the current voting period
        const currentVotingPeriod = await prisma.votingPeriod.findFirst({
          where: { current: true },
        });

        if (!currentVotingPeriod) {
          throw new Error("No active voting period found");
        }

        // Find the user with the matching username and current voting period
        const user = await prisma.user.findFirst({
          where: {
            username: credentials.username,
            votingPeriodId: currentVotingPeriod.id,
          },
          include: {
            votingPeriod: true,
          },
        });

        if (!user) {
          throw new Error("You don't qualify for the current voting period");
        }

        // Check password
        if (!(await bcrypt.compare(credentials.password, user.password))) {
          throw new Error("Invalid username or password");
        }

        // Admin check (if needed)
        if (
          user.adminLevel === 0 &&
          user.votingPeriodId !== currentVotingPeriod.id
        ) {
          throw new Error(
            "You are not authorized to access this voting period"
          );
        }

        return user;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }: any) => {
      if (user) {
        token.user_id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.adminLevel = user.adminLevel;
        token.votingPeriodId = user.votingPeriodId;
      }
      return Promise.resolve(token);
    },
    session: async ({ session, token }: any) => {
      if (token) {
        session.user.id = token.user_id;
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.adminLevel = token.adminLevel;
        session.user.votingPeriodId = token.votingPeriodId;
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
