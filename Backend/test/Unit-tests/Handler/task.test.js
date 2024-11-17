const TaskHandler = require("../../../src/Handler/TaskHandler");
const taskRoutes = require("../../../src/router/Task");
const { mockRequest, mockResponse } = require("mock-req-res");

const express = require("express");
const request = require("supertest");
const UserInfoHandler = require("../../../src/Handler/UserInfoHandler");

jest.mock("../../../src/Utility/Services", () => ({
    get_user_persistence: () => ({
        get_user: jest.fn(),
        get_room_id: jest.fn(),
    }),
    get_room_persistence: () => ({
        add_task_to_room: jest.fn(),
        delete_task_from_room: jest.fn(),
        get_completed_tasks: jest.fn(),
        get_pending_tasks: jest.fn(),
    }),

    get_task_persistence: () => ({
        generate_new_task: jest.fn(),
        get_task_by_id: jest.fn(),
        update_task: jest.fn(),
        delete_task: jest.fn(),
        mark_completed: jest.fn(),
    }),
    get_notification_persistence: () => ({}),
}));

jest.mock("../../../src/Handler/UserInfoHandler", () => {
    return jest.fn().mockImplementation(() => ({
        is_valid_user: jest.fn(), //.mockImplementation(() => true),
        areRoommates: jest.fn(), //.mockImplementation(() => true),
    }));
});

describe("Unit test for GET /", () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use("/", taskRoutes);
    });

    it("should return a 200 status with a welcome message", async () => {
        const res = await request(app).get("/");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: "Welcome to the Task paths" });
    });
});

describe("Unit test for creating a task", () => {
    let task_handler;
    let user_info_handler;
    let req, res;
    let mock_get_room;
    let mock_generate_new_task;
    let mock_add_task_to_room;

    beforeEach(() => {
        user_info_handler = new UserInfoHandler();
        task_handler = new TaskHandler(user_info_handler);
        req = mockRequest();
        res = mockResponse();

        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn();
        jest.clearAllMocks();

        //Mocking the validation functions
        mock_get_room = task_handler.get_user_persistence().get_room_id.mockImplementation((user_id) => "room1");
        mock_generate_new_task = task_handler
            .get_task_persistence()
            .generate_new_task.mockImplementation((unique_id, task_description, user_id, due_date) => {
                return "SUCCESS";
            });
        mock_add_task_to_room = task_handler
            .get_room_persistence()
            .add_task_to_room.mockImplementation((room_id, task_id) => {
                return "SUCCESS";
            });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("Send a success response verifying that the user was correctly created", async () => {
        // Setup valid request body
        req.body = {
            tn: "washing dishes",
            frm: "user1@gmail.com",
            to: "user2@gmail.com",
            date: "2024-11-11",
        };
        user_info_handler.is_valid_user.mockImplementation(() => true);
        user_info_handler.areRoommates.mockImplementation(() => true);
        await task_handler.create_task(req, res);
        // Verify the response
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Task created successfully" });
    });
    it("should return 403 when the user is invalid", async () => {
        // Setup invalid request body
        req.body = {
            tn: "washing dishes",
            frm: "user1@gmail.com",
            to: "user2@gmail.com",
            date: "2024-11-11",
        };

        user_info_handler.is_valid_user.mockImplementation(() => false);

        // Call create_user
        await task_handler.create_task(req, res);
        // Check response status and message
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid users involved",
        });
    });
    it("should return 403 when the users are not roommates", async () => {
        // Setup invalid request body
        req.body = {
            tn: "washing dishes",
            frm: "user1@gmail.com",
            to: "user2@gmail.com",
            date: "2024-11-11",
        };

        user_info_handler.is_valid_user.mockImplementation(() => true);
        user_info_handler.areRoommates.mockImplementation(() => false);
        // Call create_user
        await task_handler.create_task(req, res);
        // Check response status and message
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: "Users are not roommates",
        });
    });
    it("should return 403 when the date is invalid", async () => {
        // Setup invalid request body
        req.body = {
            tn: "Task 1",
            frm: "user1@gmail.com",
            to: "user2@gmail.com",
            date: "2004-11-11",
        };

        user_info_handler.is_valid_user.mockImplementation(() => true);
        user_info_handler.areRoommates.mockImplementation(() => true);

        // Call create_user
        await task_handler.create_task(req, res);
        // Check response status and message
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid task name or due date",
        });
    });
    it("should return 500 when an exception is thrown", async () => {
        // Setup valid request body
        req.body = {
            tn: "washing dishes",
            frm: "user1@gmail.com",
            to: "user2@gmail.com",
            date: "2024-11-11",
        };

        user_info_handler.is_valid_user.mockImplementation(() => true);
        user_info_handler.areRoommates.mockImplementation(() => true);

        mock_generate_new_task.mockImplementation((user_id) => {
            throw new Error("Something has occurred");
        });

        // Call create_task
        await task_handler.create_task(req, res);

        // Verify the response
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "An error occurred while creating the task" });
    });
});

describe("Unit test for editing a task", () => {
    let task_handler;
    let user_info_handler;
    let req, res;
    let mock_get_room;
    let mock_edit_task;
    let mock_add_task_to_room;
    let mock_task_exists;

    beforeEach(() => {
        user_info_handler = new UserInfoHandler();
        task_handler = new TaskHandler(user_info_handler);
        req = mockRequest();
        res = mockResponse();

        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn();
        jest.clearAllMocks();

        // Mocking the validation functions
        mock_edit_task = task_handler
            .get_task_persistence()
            .update_task.mockImplementation((unique_id, task_description, user_id, due_date) => {
                return "SUCCESS";
            });
        mock_get_room = task_handler.get_user_persistence().get_room_id.mockImplementation((user_id) => "room1");
        mock_add_task_to_room = task_handler
            .get_room_persistence()
            .add_task_to_room.mockImplementation((room_id, task_id) => {
                return "SUCCESS";
            });
        mock_task_exists = task_handler
            .get_task_persistence()
            .get_task_by_id.mockImplementation((task_id) => "SUCCESS");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("Send a success response verifying that the task was edited", async () => {
        // Setup valid request body
        req.body = {
            id: "taskid",
            tn: "washing dishes",
            frm: "user1@gmail.com",
            to: "user2@gmail.com",
            date: "2024-11-11",
        };
        user_info_handler.is_valid_user.mockImplementation(() => true);
        user_info_handler.areRoommates.mockImplementation(() => true);

        await task_handler.edit_task(req, res);
        // Verify the response
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Task updated successfully" });
    });
    it("should return 403 when the user is invalid", async () => {
        // Setup invalid request body
        req.body = {
            id: "taskid",
            tn: "washing dishes",
            frm: "user1@gmail.com",
            to: "user2@gmail.com",
            date: "2024-11-11",
        };
        user_info_handler.is_valid_user.mockImplementation(() => false);

        // Call create_user
        await task_handler.edit_task(req, res);
        // Check response status and message
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid users involved",
        });
    });
    it("should return 403 when the users are not roommates", async () => {
        // Setup invalid request body
        req.body = {
            id: "taskid",
            tn: "washing dishes",
            frm: "user1@gmail.com",
            to: "user2@gmail.com",
            date: "2024-11-11",
        };
        user_info_handler.is_valid_user.mockImplementation(() => true);
        user_info_handler.areRoommates.mockImplementation(() => false);
        // Call create_user
        await task_handler.edit_task(req, res);
        // Check response status and message
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: "Users are not roommates",
        });
    });
    it("should return 403 when the date is invalid", async () => {
        // Setup invalid request body
        req.body = {
            id: "taskid",
            tn: "Task 1",
            frm: "user1@gmail.com",
            to: "user2@gmail.com",
            date: "2004-11-11",
        };

        user_info_handler.is_valid_user.mockImplementation(() => true);
        user_info_handler.areRoommates.mockImplementation(() => true);

        // Call create_user
        await task_handler.create_task(req, res);
        // Check response status and message
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid task name or due date",
        });
    });
    it("should return 403 when the date is invalid", async () => {
        // Setup invalid request body
        req.body = {
            id: "taskid",
            tn: "Task 1",
            frm: "user1@gmail.com",
            to: "user2@gmail.com",
            date: "2024-13-01",
        };

        user_info_handler.is_valid_user.mockImplementation(() => true);
        user_info_handler.areRoommates.mockImplementation(() => true);

        // Call create_user
        await task_handler.create_task(req, res);
        // Check response status and message
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid task name or due date",
        });
    });
    it("should return 403 when the date is invalid", async () => {
        // Setup invalid request body
        req.body = {
            id: "taskid",
            tn: "Task 1",
            frm: "user1@gmail.com",
            to: "user2@gmail.com",
            date: "November 11, 2024",
        };

        user_info_handler.is_valid_user.mockImplementation(() => true);
        user_info_handler.areRoommates.mockImplementation(() => true);

        // Call create_user
        await task_handler.create_task(req, res);
        // Check response status and message
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid task name or due date",
        });
    });
    it("should return 500 when an exception is thrown", async () => {
        // Setup valid request body
        req.body = {
            id: "taskid",
            tn: "washing dishes",
            frm: "user1@gmail.com",
            to: "user2@gmail.com",
            date: "2024-11-11",
        };

        user_info_handler.is_valid_user.mockImplementation(() => true);
        user_info_handler.areRoommates.mockImplementation(() => true);
        mock_edit_task.mockImplementation((user_id) => {
            throw new Error("Something has occurred");
        });

        // Call create_task
        await task_handler.edit_task(req, res);

        // Verify the response
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "An error occurred while updating the task" });
    });
});

describe("Unit test for delete a task", () => {
    let task_handler;
    let user_info_handler;
    let req, res;
    let get_user_mock;
    let get_task_list_mock;
    let delete_task_mock, mock_get_room;

    beforeEach(() => {
        user_info_handler = new UserInfoHandler();
        task_handler = new TaskHandler(user_info_handler);

        req = mockRequest();
        res = mockResponse();

        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn();
        jest.clearAllMocks();

        // Commonly used mocks
        task_handler.get_user_persistence().get_room_id.mockImplementation((user_id) => "room1");
        task_handler.get_task_persistence().get_task_by_id.mockImplementation((task_id) => "SUCCESS");
        task_handler.get_room_persistence().get_completed_tasks.mockImplementation((room_id) => [
            { task_id: "task1", task_description: "Test Task 1" },
            { task_id: "task3", task_description: "Test Task 3" },
        ]);
        task_handler.get_room_persistence().delete_task_from_room.mockImplementation(() => "SUCCESS");
        delete_task_mock = task_handler.get_task_persistence().delete_task.mockImplementation(() => "SUCCESS");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should return 200 when task is successfully deleted", async () => {
        req.body = { id: "task1", frm: "user1@gmail.com" };

        user_info_handler.is_valid_user.mockImplementation(() => true);

        await task_handler.delete_task(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Task deleted successfully" });
    });

    it("should return 403 when user is invalid", async () => {
        req.body = { id: "task1", frm: "user1@gmail.com" };

        user_info_handler.is_valid_user.mockImplementation(() => false);

        await task_handler.delete_task(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid user" });
    });

    it("should return 404 when the task is not found in completed tasks", async () => {
        req.body = { id: "task2", frm: "user1@gmail.com" };

        user_info_handler.is_valid_user.mockImplementation(() => true);
        // Adjust for this test

        await task_handler.delete_task(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Task not found" });
    });

    it("should return 500 when an exception is thrown", async () => {
        req.body = { id: "task1", frm: "user1@gmail.com" };

        user_info_handler.is_valid_user.mockImplementation(() => true);

        delete_task_mock.mockImplementation((user_id) => {
            throw new Error("Something has occurred");
        }); // Custom mock setup for this test

        await task_handler.delete_task(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "An error occurred while deleting the task" });
    });
});

describe("Unit test for marking as completed", () => {
    let task_handler;
    let user_info_handler;
    let req, res;
    let get_user_mock;
    let get_task_list_mock;
    let delete_task_mock, mock_get_room;

    beforeEach(() => {
        user_info_handler = new UserInfoHandler();
        task_handler = new TaskHandler(user_info_handler);

        req = mockRequest();
        res = mockResponse();

        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn();
        jest.clearAllMocks();

        // Commonly used mocks
        task_handler.get_user_persistence().get_room_id.mockImplementation((user_id) => "room1");
        task_handler.get_room_persistence().get_pending_tasks.mockImplementation((room_id) => [
            { task_id: "task1", task_description: "Test Task 1" },
            { task_id: "task3", task_description: "Test Task 3" },
        ]);

        task_handler.get_task_persistence().mark_completed.mockImplementation(() => "SUCCESS");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should return 200 when task is successfully completed", async () => {
        req.body = { id: "task1", frm: "user1@gmail.com" };
        user_info_handler.is_valid_user.mockImplementation(() => true);

        await task_handler.mark_completed(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Task marked as completed" });
    });

    it("should return 403 when user is invalid", async () => {
        req.body = { id: "task1", frm: "" };

        await task_handler.mark_completed(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid user" });
    });

    it("should return 404 when the task is not found in pending tasks", async () => {
        req.body = { id: "task2", frm: "user1@gmail.com" };

        user_info_handler.is_valid_user.mockImplementation(() => true);
        // Adjust for this test

        await task_handler.mark_completed(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Task not found" });
    });

    it("should return 500 when an exception is thrown", async () => {
        req.body = { id: "task1", frm: "user1@gmail.com" };
        user_info_handler.is_valid_user.mockImplementation(() => true);
        task_handler.get_task_persistence().mark_completed.mockImplementation(() => "FAILURE");
        await task_handler.mark_completed(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "An error occurred while updating the task" });
    });
});
