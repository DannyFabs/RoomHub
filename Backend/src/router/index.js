const awsServerlessExpress = require("aws-serverless-express");
const express = require("express");
const User = require("./User");
const Room = require("./Room");
const Notification = require("./Notification");
const Task = require("./Task");
const cors = require("cors");

require("dotenv").config(); // Load environment variables

// entrance into all other routes
const app = express();

app.use(cors());
app.use(express.json());
app.use("/user", User);
app.use("/room", Room);
app.use("/notification", Notification);
app.use("/task", Task);

app.use("/", async (req, res) => {
    res.status(200).json({ message: "Welcome to the api" });
});

const server = awsServerlessExpress.createServer(app);

if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    // AWS express
    exports.handler = (event, context) => {
        awsServerlessExpress.proxy(server, event, context);
    };
} else {
    // useful for tests to treat backend like a regular express app.
    module.exports = app;
}
