import { auth } from "express-oauth2-jwt-bearer";
import dotenv from "dotenv";
dotenv.config();

export const checkJwt = auth({
  audience: process.env.AUTH2_AUDIENCE,
  issuerBaseURL: process.env.DOMAIN,
});
