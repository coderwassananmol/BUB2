import NextAuth from "next-auth";
import WikimediaProvider from "next-auth/providers/wikimedia";
import winston from "winston";
const logger = winston.loggers.get("defaultLogger");

async function refetchAccessToken(refreshToken) {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_WIKIMEDIA_URL + "/w/rest.php/oauth2/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: process.env.WIKIMEDIA_CLIENT_ID,
          client_secret: process.env.WIKIMEDIA_CLIENT_SECRET,
        }),
      }
    );
    return await response.json();
  } catch (error) {
    logger.log({
      level: "error",
      message: `refetchAccessToken: ${error}`,
    });
    throw error;
  }
}

export const authOptions = {
  providers: [
    WikimediaProvider({
      clientId: process.env.WIKIMEDIA_CLIENT_ID,
      clientSecret: process.env.WIKIMEDIA_CLIENT_SECRET,
      token:
        process.env.NEXT_PUBLIC_WIKIMEDIA_URL +
        "/w/rest.php/oauth2/access_token",
      userinfo:
        process.env.NEXT_PUBLIC_WIKIMEDIA_URL +
        "/w/rest.php/oauth2/resource/profile",
      authorization: {
        url:
          process.env.NEXT_PUBLIC_WIKIMEDIA_URL +
          "/w/rest.php/oauth2/authorize",
      },
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
    async jwt({ token, account }) {
      const threeHoursThirtyMinutesInMilliseconds = 12600000;
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresIn = Date.now() + threeHoursThirtyMinutesInMilliseconds;
      }
      // Refresh the token if it's expired
      if (token.expiresIn && Date.now() > token.expiresIn) {
        try {
          const new_session = await refetchAccessToken(token.refreshToken);
          if (new_session.access_token) {
            token.accessToken = new_session.access_token;
            token.refreshToken = new_session.refresh_token;
            token.expiresIn =
              Date.now() + threeHoursThirtyMinutesInMilliseconds;
          }
          return token;
        } catch (error) {
          logger.log({
            level: "error",
            message: `jwt callback: ${error}`,
          });
        }
      }
      return token;
    },
    async session({ session, token, user }) {
      // Add the access token to the session object
      session.accessToken = token.accessToken;
      session.expiresIn = token.expiresIn;
      return session;
    },
  },
};

export default (req, res) => NextAuth(req, res, authOptions);
