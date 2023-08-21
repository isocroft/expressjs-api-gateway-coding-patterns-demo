const dotenv = require("dotenv");

dotenv.config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const accessEnv = require("./accessEnv");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

const PORT = accessEnv("PORT", 7777);

const listener = app.listen(PORT, "0.0.0.0", () => {
  console.info(`API gateway listening on port ${listener.address().port}`);
});
