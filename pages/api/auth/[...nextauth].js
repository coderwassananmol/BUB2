import NextAuth from "next-auth";
import WikimediaProvider from "next-auth/providers/wikimedia";
import winston from "winston";
const logger = winston.loggers.get("defaultLogger");

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
  logger: {
    debug(code, metadata) {
      // store logs for every user logging in using OAuth
      if (code === "OAUTH_CALLBACK_RESPONSE" && metadata.account.access_token) {
        logger.log({
          level: "info",
          message: `User ${metadata.profile.name} logged in using ${
            metadata.account.provider.charAt(0).toUpperCase() +
            metadata.account.provider.slice(1)
          } OAuth`,
        });
      }
    },
    error(code, metadata) {
      // store logs of aborted logins by users using OAuth
      if (code === "OAUTH_CALLBACK_HANDLER_ERROR") {
        logger.log({
          level: "error",
          message: `[${code}] ${metadata.error_description}`,
        });
      }
    },
  },

  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      // This is called whenever a user signs in
      if (account) {
        // Add the access token to the token object
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token, user }) {
      // This is called whenever a session is accessed
      // Add the access token to the session object
      session.accessToken = token.accessToken;
      return session;
    },
  },
};

export default (req, res) => NextAuth(req, res, authOptions);
