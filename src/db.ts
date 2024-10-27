import { Pool } from "pg";
import QRCode from "qrcode";
import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.CONNECTION_STRING;

const pool = new Pool({
  connectionString,
});

export async function getAllTickets() {
  try {
    const queryResult = await pool.query(
      "select count(*) as counttickets from tickets;"
    );
    const countTickets = queryResult.rows[0].counttickets;
    return countTickets;
  } catch (error) {
    console.error(error);
  }
}

export async function createTicket(
  vatin: String,
  firstName: String,
  lastName: String
) {
  try {
    const queryResult = await pool.query(
      "INSERT INTO tickets (vatin, firstname, lastname) VALUES($1, $2, $3) returning uuid;",
      [vatin, firstName, lastName]
    );
    const createdTicketUUID = queryResult.rows[0].uuid;
    const generatedQR = await QRCode.toDataURL(
      `${process.env.BASE_URL}/${createdTicketUUID}`
    );
    return generatedQR;
  } catch (error) {
    console.error(error);
  }
}

export async function getDetails(uuid: String) {
  try {
    const queryResult = await pool.query(
      "select vatin, firstname, lastname, createdat from tickets where uuid = $1;",
      [uuid]
    );
    const values = queryResult.rows[0];
    return [values.vatin, values.firstname, values.lastname, values.createdat];
  } catch (error) {
    console.error(error);
  }
}

export async function getTicketsForVatin(vatin: String) {
  try {
    const queryResult = await pool.query(
      "select count(*) as counttickets from tickets where vatin = $1;",
      [vatin]
    );
    const countTickets = queryResult.rows[0].counttickets;
    return countTickets;
  } catch (error) {
    console.error(error);
  }
}
