const User = require("./router/User");
const Room = require("./router/Room");
const Notification = require("./router/Notification");
const Task = require("./router/Task");

const express = require("express");
const cors = require("cors");
require("dotenv").config();

// testing performance
const fs = require("fs");
const path = require("path");
const logFilePath = path.join(__dirname, "profiling_results.log");

const app = express();
const port = 3001;
app.use(express.json());
app.use(cors());

// Middleware to profile each request
app.use((req, res, next) => {
    const startMark = `${req.method} ${req.url} - start`;
    const endMark = `${req.method} ${req.url} - end`;

    performance.mark(startMark);

    res.on("finish", () => {
        performance.mark(endMark);
        performance.measure(`${req.method} ${req.url}`, startMark, endMark);

        const [measure] = performance.getEntriesByName(`${req.method} ${req.url}`);
        const logMessage = `Endpoint: ${req.method} ${req.url} took ${measure.duration.toFixed(2)} ms\n`;
        console.log(logMessage);

        // Append the log message to the file
        fs.appendFile(logFilePath, logMessage, (err) => {
            if (err) {
                console.error("Error writing to log file", err);
            }
        });

        // Clear marks and measures to avoid memory leaks
        performance.clearMarks(startMark);
        performance.clearMarks(endMark);
        performance.clearMeasures(`${req.method} ${req.url}`);
    });

    next();
});

app.use("/user", User);
app.use("/room", Room);
app.use("/notification", Notification);
app.use("/task", Task);

app.get("/", async (req, res) => {
    console.log(req.body);
    res.status(200).json({ message: "we cooking rn" });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
