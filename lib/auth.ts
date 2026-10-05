import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "./db";
import AdminUser from "@/models/AdminUser";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        await connectDB();
        const user = await AdminUser.findOne({ email: credentials.email });
        if (!user) {
          return null;
        }
        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!isValid) {
          return null;
        }
        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          district: user.district,
          state: user.state,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.fullName = (user as any).fullName;
        token.district = (user as any).district;
        token.state = (user as any).state;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).fullName = token.fullName;
        (session.user as any).district = token.district;
        (session.user as any).state = token.state;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
