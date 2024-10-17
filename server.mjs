import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import morgan from "morgan";
import crawlRouter from "./routes/routes.mjs";

const app = express();

app.use(cors());
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(morgan("combined", { stream: accessLogStream }));

//use routes
app.use("/api/crawl", crawlRouter);

app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
