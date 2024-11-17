const request = require("supertest");
const app = require("../../../src/router/index");
const taskRouter = require("../../../src/router/Task");
const express = require("express");

jest.mock("../../../src/Handler/TaskHandler", () => {
    return jest.fn().mockImplementation(() => ({
        // function mocks
        create_task: jest.fn().mockImplementation((req, res) => {
            res.status(200).json({ message: "Task created successfully" });
        }),

        delete_task: jest.fn().mockImplementation((req, res) => {
            res.status(200).json({ message: "Task deleted successfully" });
        }),

        edit_task: jest.fn().mockImplementation((req, res) => {
            res.status(200).json({ message: "Task updated successfully" });
        }),
        mark_completed: jest.fn().mockImplementation((req, res) => {
            res.status(200).json({ message: "Task marked as completed" });
        }),
    }));
});

describe("Task router tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        app.use(express.json());
        app.use("/task", taskRouter); // Hook up the router for testing
    });

    it("POST /create-task should create a new task", async () => {
        const requestBody = {
            tn: "Test Task",
            frm: "user1",
            to: "user2",
            date: "2024-12-31",
        };
        const response = await request(app).post("/task/create-task").send(requestBody);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Task created successfully");
    });

    it("POST /edit-task should update an existing task", async () => {
        const requestBody = {
            id: "task123",
            tn: "Updated Task",
            frm: "user1",
            to: "user3",
            date: "2024-12-31",
        };
        const response = await request(app).post("/task/edit-task").send(requestBody);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Task updated successfully");
    });

    it("DELETE /delete-task should delete a task", async () => {
        const requestBody = {
            id: "task123",
            frm: "user1",
        };
        const response = await request(app).delete("/task/delete-task").send(requestBody);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Task deleted successfully");
    });

    it("PATCH /mark-completed should mark a task as completed", async () => {
        const requestBody = {
            id: "task123",
            frm: "user1",
        };
        const response = await request(app).patch("/task/mark-completed").send(requestBody);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Task marked as completed");
    });
});
