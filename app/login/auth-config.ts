import { NextAuthOptions } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

/**
 * NextAuth Configuration for AWS Cognito with Google Federated Authentication
 *
 * This configuration enables social login via AWS Cognito with Google as federated identity provider.
 * Uses Cognito's hosted UI for authentication flow.
 *
 * Environment Variables Required:
 * - COGNITO_CLIENT_ID: Your AWS Cognito App Client ID
 * - COGNITO_CLIENT_SECRET: Your AWS Cognito App Client Secret
 * - COGNITO_ISSUER: Your Cognito User Pool URL (e.g., https://cognito-idp.{region}.amazonaws.com/{userPoolId})
 * - COGNITO_DOMAIN: Your Cognito hosted UI domain (e.g., https://your-domain.auth.region.amazoncognito.com)
 * - NEXTAUTH_SECRET: Secret for encrypting tokens (generate with: openssl rand -base64 32)
 * - NEXTAUTH_URL: Your application URL (e.g., http://localhost:3000)
 */

export const authOptions: NextAuthOptions = {
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET ?? "",
      issuer: process.env.COGNITO_ISSUER!,
      ...(process.env.COGNITO_CLIENT_SECRET
        ? {}
        : {
            client: {
              token_endpoint_auth_method: "none", // Public client doesn't use client secret
            },
          }),
      authorization: {
        params: {
          // Force Google as the identity provider for federated login
          identity_provider: "Google",
          response_type: "code",
          scope: "openid email profile",
        },
      },
      checks: ["state", "nonce"],
    }),
  ],

  /**
   * Custom Pages Configuration
   * Redirect users to our custom login page instead of NextAuth's default
   */
  pages: {
    signIn: "/login",
    // signOut: "/login",
    // error: "/login/error",
    // verifyRequest: "/login/verify",
  },

  /**
   * Callbacks
   * Used to control what happens during authentication flow
   */
  callbacks: {
    /**
     * JWT Callback
     * Runs when a JWT is created or updated
     * Add custom data to the JWT token here
     */
    async jwt({ token, user, account }) {
      // On initial sign-in, add user data to token
      if (account && user) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
        token.userId = user.id;
      }

      return token;
    },

    /**
     * Session Callback
     * Runs when a session is checked
     * Add custom data to the session object here
     */
    async session({ session, token }) {
      // Add token data to session for client-side access
      session.user.id = token.userId as string;
      session.accessToken = token.accessToken as string;
      session.idToken = token.idToken as string;

      return session;
    },

    /**
     * Redirect Callback
     * Controls where to redirect users after sign-in
     */
    async redirect({ url, baseUrl }) {
      console.log("🔄 Redirect callback:", { url, baseUrl });

      // Redirect to home page after successful login
      if (url.startsWith(baseUrl)) {
        console.log("✅ Redirecting to:", url);
        return url;
      }

      // Default redirect to home page
      console.log("✅ Redirecting to /");
      return `${baseUrl}/`;
    },

    /**
     * Sign In Callback
     * Called when sign-in is attempted
     */
    async signIn({ user, account, profile }) {
      console.log("🔑 Sign in callback:", {
        user: user?.email,
        provider: account?.provider,
        profile: profile?.email,
      });
      return true; // Allow sign in
    },
  },

  /**
   * Session Configuration
   */
  session: {
    strategy: "jwt", // Use JWT-based sessions (no database required)
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  /**
   * JWT Configuration
   */
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  /**
   * Secret for JWT encryption (required in production)
   */
  secret: process.env.NEXTAUTH_SECRET,

  /**
   * Debug mode (disable in production)
   */
  debug: process.env.NODE_ENV === "development",
};
