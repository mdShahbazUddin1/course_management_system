const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const cookiParser = require("cookie-parser");
const { connection } = require("./config/db");
const { studentRouter } = require("./routes/students.route");
const PORT = process.env.PORT;
const { UserModel } = require("./models/students.model");
// to render verify html
app.use(express.json());
app.use(cors());
app.use(cookiParser());




app.use("/user", studentRouter);

app.listen(PORT, async () => {
  try {
    await connection;
    console.log("Connected to DB");
  } catch (error) {
    console.log("Something went wrong\n", error);
  }
  console.log(`Server is running at port: ${PORT}`);
});
