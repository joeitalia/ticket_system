import NextAuth from "next-auth";
import { ObjectId } from "mongodb";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { DBNAME } from "../../constant";

export const authOptions: any = {
  providers: [
    // 🧠 Custom Username + Password login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const client = await clientPromise;
        const db = client.db(DBNAME);
        const user = await db
          .collection("Users")
          .findOne({ email: credentials?.email });
        if (!user) throw new Error("Your email is not registered.");

        const department = await db
          .collection("Departments")
          .findOne({ _id: new ObjectId(user.departmentId) });

        const isValid = await bcrypt.compare(
          credentials!.password,
          user.password
        );
        if (!isValid) throw new Error("Please insert a valid password.");

        // Return safe user info for session
        return {
          id: user._id.toString(),
          email: user.email,
          isAdmin: user.isAdmin ?? false,
          firstName: user.firstName,
          lastName: user.lastName,
          middleName: user.middleName
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.isAdmin = user.isAdmin;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.middleName = user.middleName;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user = {
          id: token.id,
          isAdmin: token.isAdmin,
          email: token.email,
          firstName: token.firstName,
          lastName: token.lastName,
          middleName: token.middleName
        };
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false, // IMPORTANT for localhost
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };