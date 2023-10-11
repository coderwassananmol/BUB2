import NextAuth from "next-auth";
import WikimediaProvider from "next-auth/providers/wikimedia";
import winston from "winston";
const logger = winston.loggers.get("defaultLogger");

export const authOptions = {
  providers: [
    WikimediaProvider({
      clientId: process.env.WIKIMEDIA_CLIENT_ID,
      clientSecret: process.env.WIKIMEDIA_CLIENT_SECRET,
      authorization: {
        url:
          "https://meta.wikimedia.beta.wmflabs.org/w/rest.php/oauth2/authorize",
        params: { scope: "" },
      },
      token:
        "https://meta.wikimedia.beta.wmflabs.org//w/rest.php/oauth2/access_token",
      userinfo:
        "https://meta.wikimedia.beta.wmflabs.org//w/rest.php/oauth2/resource/profile",
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
};

export default (req, res) => NextAuth(req, res, authOptions);
