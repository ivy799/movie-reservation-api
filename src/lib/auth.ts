import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import { PrismaClient } from "@prisma/client"
import { NextAuthOptions } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    async signIn({ user, account }) {
      console.log("User login:", user)
      console.log("Access Token dari Google:", account?.access_token)
      if (account?.access_token) {
        await prisma.account.update({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          data: { access_token: account.access_token },
        })
      }
    },
    async signOut({ session }) {
      if (session?.user?.id) {
        console.log("Menghapus session untuk user:", session.user.id)

        await prisma.session.deleteMany({
          where: { userId: session.user.id },
        })

        console.log("Session berhasil dihapus")
      }
    },
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }

      return session;
    },
  }
}
