import NextAuth from "next-auth";
import WikimediaProvider from "next-auth/providers/wikimedia";

export const authOptions = {
  providers: [
    WikimediaProvider({
      clientId: process.env.WIKIMEDIA_CLIENT_ID,
      clientSecret: process.env.WIKIMEDIA_CLIENT_SECRET,
    }),
  ],
  session: {
    jwt: true,
  },
  debug: process.env.NODE_ENV !== "production",
};

export default (req, res) => NextAuth(req, res, authOptions);
