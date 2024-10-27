import dotenv from "dotenv";
dotenv.config();

export const config = {
  authRequired: false,
  idpLogout: true,
  secret: process.env.OIDC_SECRET,
  baseURL: process.env.RENDER_EXTERNAL_URL,
  clientID: process.env.OIDC_CLIENT_ID,
  issuerBaseURL: process.env.DOMAIN,
  clientSecret: process.env.OIDC_CLIENT_SECRET,
  authorizationParams: {
    response_type: "code",
  },
};
