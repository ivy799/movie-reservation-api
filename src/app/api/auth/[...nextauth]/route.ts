import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"


// sign in and sign out
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
