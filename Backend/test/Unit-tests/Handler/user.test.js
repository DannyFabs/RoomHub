const UserInfoHandler = require("../../../src/Handler/UserInfoHandler");
const userRoutes = require("../../../src/router/User");
const { mockRequest, mockResponse } = require("mock-req-res");

const express = require("express");
const request = require("supertest");

jest.mock("../../../src/Utility/Services", () => ({
    get_user_persistence: () => ({
        get_user: jest.fn(),
        get_notification: jest.fn(),
        remove_room_id: jest.fn(),
        get_room_id: jest.fn(),
        save_new_user: jest.fn(),
        update_notification_set: jest.fn(),
    }),

    get_room_persistence: () => ({
        get_room_name: jest.fn(),
        delete_room: jest.fn(),
        remove_user_id: jest.fn(),
        get_room_users: jest.fn(),
    }),

    get_notification_persistence: () => ({
        get_msg_type: jest.fn(),
        update_notification_status: jest.fn(),
        delete_notification: jest.fn(),
    }),
}));

describe("Unit test for GET /", () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use("/", userRoutes);
    });

    it("should return a 200 status with a welcome message", async () => {
        const res = await request(app).get("/");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ Message: "Welcome to the User paths" });
    });
});

describe("Unit test for creating user", () => {
    let user_info_handler;
    let req, res;

    beforeEach(() => {
        user_info_handler = new UserInfoHandler();
        req = mockRequest();
        res = mockResponse();

        res.status = jest.fn().mockReturnValue(res); // Allows chaining like res.status(200).json()
        res.json = jest.fn();
        jest.clearAllMocks();
    });

    it("Send a success response verifying that the user was correctly created", async () => {
        // Setup valid request body
        req.body = { id: "abc@gmail.com" };

        // Mock save_new_user to return a success response object with status and message
        user_info_handler.get_user_persistence().save_new_user.mockImplementation(() => ({
            status: 200,
            message: "User created successfully",
        }));

        // Call create_user
        await user_info_handler.create_user(req, res);

        // Verify the response
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "User created successfully" });
    });

    it("should return 400 when user_id is invalid", async () => {
        // Setup invalid request body
        req.body = { id: "" };

        // Call create_user
        await user_info_handler.create_user(req, res);

        // Check response status and message
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Error Creating User- User id is invalid",
        });
    });

    it("should return 500 when an exception is thrown", async () => {
        await user_info_handler.create_user(req, res);
        // Verify the response
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });
});

describe("Testing getting a users room", () => {
    let userInfoHandler;
    beforeEach(() => {
        userInfoHandler = new UserInfoHandler();
        req = mockRequest();
        res = mockResponse();

        res.status = jest.fn().mockReturnValue(res); // Allows chaining like res.status(200).json()
        res.json = jest.fn();
        jest.clearAllMocks();
    });

    it("Send the users room name successfully", async () => {
        // mock get_user and get_room_name
        userInfoHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return { user_id: "test@gmail.com", room_id: "111-111" };
        });
        userInfoHandler.get_room_persistence().get_room_name.mockImplementation((room_id) => {
            return "UpBoyz";
        });

        req = mockRequest({
            params: { id: "test@gmail.com" },
        });

        await userInfoHandler.get_user_room(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ room_name: "UpBoyz" });
    });

    it("Should send error with invalid username", async () => {
        req = mockRequest({
            params: { id: " " },
        });

        await userInfoHandler.get_user_room(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ room_name: "This username is invalid" });
    });

    it("Should send error status code with user that doesn't exist", async () => {
        // mock get_user and get_room_name
        userInfoHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return null;
        });

        req = mockRequest({
            params: { id: "fake_user@gmail.com" },
        });

        await userInfoHandler.get_user_room(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ room_name: "User not found" });
    });

    it("Send error from the backend", async () => {
        // mock get_user and get_room_name
        await userInfoHandler.get_user_room(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });

    it("Send error if the user doesn't have a room", async () => {
        // mock get_user and get_room_name
        userInfoHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return { user_id: "test@gmail.com", room_id: undefined };
        });
        userInfoHandler.get_room_persistence().get_room_name.mockImplementation((room_id) => {
            return undefined;
        });

        req = mockRequest({
            params: { id: "test@gmail.com" },
        });

        await userInfoHandler.get_user_room(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ room_name: "NA" });
    });
});

describe("Testing getting a user notification", () => {
    let userInfoHandler;
    beforeEach(() => {
        userInfoHandler = new UserInfoHandler();
        req = mockRequest();
        res = mockResponse();

        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn();
        jest.clearAllMocks();
    });

    it("Send the user notification message and type successfully", async () => {
        // mock get_user get_notification and get_msg_type
        userInfoHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return { user_id: "test@gmail.com" };
        });

        userInfoHandler.get_user_persistence().get_notification.mockImplementation((user_id) => {
            return ["111-111", "222-222"];
        });

        userInfoHandler.get_notification_persistence().update_notification_status.mockImplementation((notif_id) => {
            console.log(`Set up the status of notif_id ${notif_id} to be read`);
        });

        userInfoHandler.get_notification_persistence().get_msg_type.mockImplementation((notif_id) => {
            if (notif_id === "111-111") {
                return {
                    msg: "dan invite luke to join their room",
                    type: "invite",
                };
            } else if (notif_id === "222-222") {
                return {
                    msg: "daniel invite lu to join their room",
                    type: "invite",
                };
            }
        });

        req = mockRequest({
            params: { id: "test@gmail.com" },
        });

        await userInfoHandler.get_user_notification(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            All_Notifications: [
                {
                    msg: "dan invite luke to join their room",
                    type: "invite",
                },
                {
                    msg: "daniel invite lu to join their room",
                    type: "invite",
                },
            ],
        });
    });

    it("Should send error with invalid username", async () => {
        req = mockRequest({
            params: { id: " " },
        });

        await userInfoHandler.get_user_notification(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "This username is invalid" });
    });

    it("Should send error status code with user that doesn't exist", async () => {
        // mock get_user and get_room_name
        userInfoHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return null;
        });

        req = mockRequest({
            params: { id: "fake_user@gmail.com" },
        });

        await userInfoHandler.get_user_notification(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("Send error from the backend", async () => {
        // mock get_user and get_room_name
        await userInfoHandler.get_user_notification(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });
});

describe("Testing leave_user_room", () => {
    let userInfoHandler;
    beforeEach(() => {
        userInfoHandler = new UserInfoHandler();
        req = mockRequest();
        res = mockResponse();

        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn();
        jest.clearAllMocks();
    });
    it("Send the user a successfully message", async () => {
        userInfoHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return { user_id: "test@gmail.com" };
        });
        // mock get_user get_notification and get_msg_type
        userInfoHandler.get_user_persistence().get_room_id.mockImplementation((user_id) => {
            return "test@gmail.com";
        });
        userInfoHandler.get_room_persistence().get_room_users.mockImplementation(() => {
            return ["test@gmail.com", "test1@gmail.com"];
        });
        userInfoHandler.get_room_persistence().delete_room.mockImplementation(() => true);
        userInfoHandler.get_user_persistence().remove_room_id.mockImplementation(() => true);

        req = mockRequest({
            params: { id: "test@gmail.com" },
        });

        await userInfoHandler.leave_user_room(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "User leave the room successfully" });
    });
    it("Send the user a room is being deleted and leave the room successfully", async () => {
        userInfoHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return { user_id: "test2@gmail.com" };
        });
        // mock get_user get_notification and get_msg_type
        userInfoHandler.get_user_persistence().get_room_id.mockImplementation((user_id) => {
            return "test2@gmail.com";
        });
        userInfoHandler.get_room_persistence().get_room_users.mockImplementation(() => {
            return ["test2@gmail.com"];
        });
        userInfoHandler.get_room_persistence().delete_room.mockImplementation(() => true);
        userInfoHandler.get_user_persistence().remove_room_id.mockImplementation(() => true);

        req = mockRequest({
            params: { id: "test2@gmail.com" },
        });

        await userInfoHandler.leave_user_room(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "The room is being deleted and user leave the room successfully",
        });
    });
    it("Should send error with invalid username", async () => {
        req = mockRequest({
            params: { id: " " },
        });

        await userInfoHandler.leave_user_room(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "This username is invalid" });
    });

    it("Should send error status code with user that doesn't exist", async () => {
        // mock get_user and get_room_name
        userInfoHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return null;
        });

        req = mockRequest({
            params: { id: "fake_user@gmail.com" },
        });

        await userInfoHandler.leave_user_room(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("Send error from the backend", async () => {
        // mock get_user and get_room_name
        await userInfoHandler.leave_user_room(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });
});
describe("Testing get_user_warning", () => {
    let userInfoHandler;
    beforeEach(() => {
        userInfoHandler = new UserInfoHandler();
        req = mockRequest();
        res = mockResponse();

        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn();
        jest.clearAllMocks();
    });

    it("Send the user notification message and type successfully", async () => {
        userInfoHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return { user_id: "test@gmail.com" };
        });
        // mock get_user get_notification and get_msg_type
        userInfoHandler.get_user_persistence().get_room_id.mockImplementation((user_id) => {
            return "test@gmail.com";
        });
        userInfoHandler.get_room_persistence().get_room_users.mockImplementation(() => {
            return ["test@gmail.com", "test1@gmail.com"];
        });
        userInfoHandler.get_room_persistence().delete_room.mockImplementation(() => true);
        userInfoHandler.get_user_persistence().remove_room_id.mockImplementation(() => true);

        req = mockRequest({
            params: { id: "test@gmail.com" },
        });

        await userInfoHandler.get_user_warning(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Warning: Are you sure want to leave this room!",
        });
    });

    it("Send the user the room will be deleted if they leave successfully", async () => {
        userInfoHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return { user_id: "test@gmail.com" };
        });
        // mock get_user get_notification and get_msg_type
        userInfoHandler.get_user_persistence().get_room_id.mockImplementation((user_id) => {
            return "test@gmail.com";
        });
        userInfoHandler.get_room_persistence().get_room_users.mockImplementation(() => {
            return ["test@gmail.com"];
        });
        userInfoHandler.get_room_persistence().delete_room.mockImplementation(() => true);
        userInfoHandler.get_user_persistence().remove_room_id.mockImplementation(() => true);

        req = mockRequest({
            params: { id: "test@gmail.com" },
        });

        await userInfoHandler.get_user_warning(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Warning: If you leave, the room will be deleted!",
        });
    });

    it("Should send error with invalid username", async () => {
        req = mockRequest({
            params: { id: " " },
        });

        await userInfoHandler.get_user_warning(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "This username is invalid" });
    });

    it("Should send error status code with user that doesn't exist", async () => {
        // mock get_user and get_room_name
        userInfoHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return null;
        });

        req = mockRequest({
            params: { id: "fake_user@gmail.com" },
        });

        await userInfoHandler.get_user_warning(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("Send error from the backend", async () => {
        // mock get_user and get_room_name
        await userInfoHandler.get_user_warning(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });
});

describe("Testing get_user_roommates", () => {
    let userInfoHandler;
    beforeEach(() => {
        userInfoHandler = new UserInfoHandler();
        req = mockRequest();
        res = mockResponse();

        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn();
        jest.clearAllMocks();
    });

    it("Send the user Successfully retrieved roommates list", async () => {
        // mock get_user get_notification and get_msg_type
        userInfoHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return { user_id: "test@gmail.com" };
        });
        // mock get_user get_notification and get_msg_type
        userInfoHandler.get_user_persistence().get_room_id.mockImplementation((user_id) => {
            return "test@gmail.com";
        });
        userInfoHandler.get_room_persistence().get_room_users.mockImplementation(() => {
            return ["test@gmail.com", "test1@gmail.com"];
        });
        req = mockRequest({
            params: { id: "test@gmail.com" },
        });

        await userInfoHandler.get_user_roommates(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ roommates: ["test@gmail.com", "test1@gmail.com"] });
    });

    it("Should send You have no roommate", async () => {
        // mock get_user get_notification and get_msg_type
        userInfoHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return { user_id: "test@gmail.com" };
        });
        // mock get_user get_notification and get_msg_type
        userInfoHandler.get_user_persistence().get_room_id.mockImplementation((user_id) => {
            return "room1";
        });
        const roommates = userInfoHandler.get_room_persistence().get_room_users.mockImplementation(() => {
            return ["test@gmail.com"];
        });

        req = mockRequest({
            params: { id: "test@gmail.com" },
        });

        await userInfoHandler.get_user_roommates(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ roommates: ["test@gmail.com"] });
    });

    it("Should send error status code with user that doesn't exist", async () => {
        // mock get_user and get_room_name
        userInfoHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return null;
        });

        req = mockRequest({
            params: { id: "fake_user@gmail.com" },
        });

        await userInfoHandler.get_user_roommates(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("Send error from the backend", async () => {
        // mock get_user and get_room_name
        await userInfoHandler.get_user_roommates(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });
});

describe("Testing get_roommate", () => {
    let userInfoHandler;
    beforeEach(() => {
        userInfoHandler = new UserInfoHandler();
        req = mockRequest();
        res = mockResponse();

        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn();
        jest.clearAllMocks();
    });

    it("Send the user you have at least one roommate", async () => {
        userInfoHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return { user_id: "test@gmail.com" };
        });
        // mock get_user get_notification and get_msg_type
        userInfoHandler.get_user_persistence().get_room_id.mockImplementation((user_id) => {
            return "test@gmail.com";
        });
        const roommates = userInfoHandler.get_room_persistence().get_room_users.mockImplementation(() => {
            return ["test@gmail.com", "test1@gmail.com"];
        });

        req = mockRequest({
            params: { id: "test@gmail.com" },
        });

        await userInfoHandler.get_roommate(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "You have at least one roommate",
        });
    });

    it("Should send You have no roommate", async () => {
        userInfoHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return { user_id: "test@gmail.com" };
        });
        // mock get_user get_notification and get_msg_type
        userInfoHandler.get_user_persistence().get_room_id.mockImplementation((user_id) => {
            return "test@gmail.com";
        });
        userInfoHandler.get_room_persistence().get_room_users.mockImplementation(() => {
            return ["test@gmail.com"];
        });

        req = mockRequest({
            params: { id: "test@gmail.com" },
        });
        await userInfoHandler.get_roommate(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "You have no roommate",
        });
    });

    it("Should send error status code that username is invalid", async () => {
        req = mockRequest({
            params: { id: "" },
        });

        await userInfoHandler.get_roommate(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "This username is invalid" });
    });

    it("Should send error status code with user that doesn't exist", async () => {
        // mock get_user and get_room_name
        userInfoHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return null;
        });

        req = mockRequest({
            params: { id: "fake_user@gmail.com" },
        });

        await userInfoHandler.get_roommate(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("Send error from the backend", async () => {
        // mock get_user and get_room_name
        await userInfoHandler.get_roommate(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });
});

describe("Testing get number of roommates", () => {
    let userInfoHandler;
    let user_id;
    beforeAll(() => {
        userInfoHandler = new UserInfoHandler();
        user_id = "test@gmail.com";
    });

    it("Return a list of users in that room", async () => {
        userInfoHandler.get_user_persistence().get_room_id.mockImplementation((user_id) => {
            return "test@gmail.com";
        });
        userInfoHandler.get_room_persistence().get_room_users.mockImplementation(() => {
            return ["test@gmail.com"];
        });

        const roommates = await userInfoHandler.get_roommates_helper(user_id);
        expect(roommates).toEqual(["test@gmail.com"]);
    });
});

describe("Testing if valid user", () => {
    let userInfoHandler;
    let user_id;
    let non_valid_user_id;
    beforeAll(() => {
        userInfoHandler = new UserInfoHandler();
        user_id = "test@gmail.com";
        non_valid_user_id = "";
    });

    it("Return true if valid user", async () => {
        userInfoHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return { user_id: "test@gmail.com" };
        });

        const result = await userInfoHandler.is_valid_user(user_id);
        expect(result).toEqual(true);
    });

    it("Return false if non-valid user", async () => {
        userInfoHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return null;
        });

        const result = await userInfoHandler.is_valid_user(non_valid_user_id);
        expect(result).toEqual(false);
    });
});

describe("Testing delete a notification", () => {
    let userInfoHandler;
    beforeEach(() => {
        userInfoHandler = new UserInfoHandler();
        req = mockRequest();
        res = mockResponse();

        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn();
        jest.clearAllMocks();
    });

    it("Send the user Notification deleted successfully", async () => {
        userInfoHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return { user_id: "test@gmail.com" };
        });
        userInfoHandler.get_user_persistence().get_notification.mockImplementation((user_id) => {
            return ["111-111", "222-222"];
        });
        userInfoHandler.get_notification_persistence().delete_notification.mockImplementation(() => true);
        userInfoHandler.get_user_persistence().update_notification_set.mockImplementation(() => true);

        req = mockRequest({
            params: { id: "test@gmail.com", notif_id: "111-111" },
        });
        await userInfoHandler.delete_notification(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Notification deleted successfully" });
    });

    it("Should send error with invalid username", async () => {
        req = mockRequest({
            params: { id: "", notif_id: "111-111" },
        });

        await userInfoHandler.delete_notification(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "This username is invalid" });
    });
    it("Should send error with invalid notification", async () => {
        req = mockRequest({
            params: { id: "test@gmail.com", notif_id: "" },
        });
        userInfoHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return { user_id: "test@gmail.com" };
        });

        await userInfoHandler.delete_notification(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "This notification id is invalid" });
    });
    it("Should send error status code with user that doesn't exist", async () => {
        // mock get_user and get_room_name
        userInfoHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return null;
        });

        req = mockRequest({
            params: { id: "fake_user@gmail.com", notif_id: "111-111" },
        });

        await userInfoHandler.delete_notification(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
    it("Should send error status code with notification that doesn't exist", async () => {
        userInfoHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return { user_id: "test@gmail.com" };
        });
        userInfoHandler.get_user_persistence().get_notification.mockImplementation((user_id) => {
            return ["333-333", "222-222"];
        });
        userInfoHandler.get_notification_persistence().delete_notification.mockImplementation(() => true);
        userInfoHandler.get_user_persistence().update_notification_set.mockImplementation(() => true);

        req = mockRequest({
            params: { id: "test@gmail.com", notif_id: "111-111" },
        });
        await userInfoHandler.delete_notification(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Notification not found" });
    });
    it("Send error from the backend", async () => {
        // mock get_user and get_room_name
        await userInfoHandler.delete_notification(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });
});
