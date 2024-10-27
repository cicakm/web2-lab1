import express from "express";
import {
  createTicket,
  getAllTickets,
  getDetails,
  getTicketsForVatin,
} from "./db";
import path from "path";
import dotenv from "dotenv";
import https from "https";
import fs from "fs";
import { auth, requiresAuth } from "express-openid-connect";
import { config } from "./auth-oidc";
import { checkJwt } from "./auth-oauth2";
dotenv.config();

const hostname = "127.0.0.1";
const port = 4100;

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(auth(config));

app.get("/", async function (req, res) {
  const countTickets = await getAllTickets();
  let loggedIn = false;
  if (req.oidc.isAuthenticated()) loggedIn = true;
  res.render("index", { countTickets, loggedIn });
});

app.post("/generate-ticket", checkJwt, async function (req, res) {
  const [vatin, firstName, lastName] = [
    req.body.vatin,
    req.body.firstName,
    req.body.lastName,
  ];
  if (
    vatin.length != 10 ||
    vatin.match(/^[0-9]+$/) == null ||
    firstName == "" ||
    lastName == "" ||
    vatin == null ||
    firstName == null ||
    lastName == null
  ) {
    res.status(400).send("Invalid data entered");
  } else {
    const ticketsForVatin = await getTicketsForVatin(vatin);
    if (ticketsForVatin >= 3) {
      res.status(400).send(`Already 3 tickets for vatin: ${vatin}`);
    } else {
      const qrcode = await createTicket(vatin, firstName, lastName);
      res.send(`<img src="${qrcode}" alt="QR Code"/>`);
    }
  }
});

app.get("/ticket-details", requiresAuth(), async function (req, res) {
  const userDetails = JSON.stringify(req.oidc.user);
  const uuid = req.query.uuid as String;
  const values = await getDetails(uuid);
  const [vatin, firstName, lastName, createdAt] = [
    values![0],
    values![1],
    values![2],
    values![3],
  ];
  res.render("ticket-details", {
    vatin,
    firstName,
    lastName,
    createdAt,
    userDetails,
  });
});

app.get("/login", (req, res) => {
  res.oidc.login({
    returnTo: "/",
    authorizationParams: {
      screen_hint: "login",
    },
  });
});

https
  .createServer(
    {
      key: fs.readFileSync("server.key"),
      cert: fs.readFileSync("server.cert"),
    },
    app
  )
  .listen(port, hostname, () => {
    console.log(`Server running at ${process.env.BASE_URL}/`);
  });
