const RoomHandler = require("../../../src/Handler/RoomHandler");
const { mockRequest, mockResponse } = require("mock-req-res");
const UserInfoHandler = require("../../../src/Handler/UserInfoHandler");

jest.mock("../../../src/Utility/Services", () => ({
    get_user_persistence: () => ({
        get_user: jest.fn(),
        update_user_room: jest.fn(),
        update_notification_set: jest.fn(),
        get_room_id: jest.fn(),
    }),

    get_room_persistence: () => ({
        get_room_name: jest.fn(),
        generate_new_room: jest.fn(),
        add_new_roommate: jest.fn(),
        get_pending_tasks: jest.fn(),
        get_completed_tasks: jest.fn(),
    }),

    get_notification_persistence: () => ({
        get_msg_type: jest.fn(),
        delete_notification: jest.fn(),
    }),
}));

jest.mock("../../../src/Handler/UserInfoHandler", () => {
    return jest.fn().mockImplementation(() => ({
        is_valid_user: jest.fn(), //.mockImplementation(() => true),
        areRoommates: jest.fn(), //.mockImplementation(() => true),
    }));
});

describe("Unit test for creating room", () => {
    let roomHandler;
    let req, res;

    beforeEach(() => {
        user_info_handler = new UserInfoHandler();
        roomHandler = new RoomHandler(user_info_handler);
        req = mockRequest();
        res = mockResponse();

        res.status = jest.fn().mockReturnValue(res); // Allows chaining like res.status(200).json()
        res.json = jest.fn();
        jest.clearAllMocks();
    });

    it("Send a success response verifying that the room was correctly created", async () => {
        // mock get_user and get_room_name
        user_info_handler.is_valid_user.mockImplementation(() => true);
        roomHandler.get_room_persistence().generate_new_room.mockImplementation((room_id, room_name, user_id) => {
            return "SUCCESS";
        });
        req.body = { id: "test@gmail.com", rm: "1000" };

        await roomHandler.create_room(req, res);

        //expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Successfully Created the new room" });
    });

    it("Send a response signifying that the room was not created", async () => {
        // mock get_user and get_room_name
        roomHandler.get_room_persistence().generate_new_room.mockImplementation((room_id, room_name, user_id) => {
            return "FAILURE";
        });
        req.body = { id: "test@gmail.com", rm: "1000" };
        user_info_handler.is_valid_user.mockImplementation(() => true);
        await roomHandler.create_room(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Retry creating the room" });
    });

    it("Send a response signifying that the user name is invalid", async () => {
        // mock get_user and get_room_name
        roomHandler.get_user_persistence().get_user.mockImplementation(() => {
            return null;
        });

        req.body = { id: "test@gmail.com", rm: "1000" };

        await roomHandler.create_room(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Bad Request-Invalid User" });
    });

    it("Send a response signifying that the room name is invalid", async () => {
        // mock get_user and get_room_name
        user_info_handler.is_valid_user.mockImplementation(() => true);
        req.body = { id: "test@gmail.com", rm: "" };

        await roomHandler.create_room(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Bad Request-Invalid Room Name" });
    });

    it("Send a response signifying that the room name and user name are invalid", async () => {
        // mock get_user and get_room_name
        roomHandler.get_user_persistence().get_user.mockImplementation(() => {
            return null;
        });

        req.body = { id: "test@gmail.com", rm: "" };

        await roomHandler.create_room(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Bad Request-Invalid User and room name" });
    });

    it("Send a response signifying that some other error has been thrown from database", async () => {
        // mock get_user and get_room_name
        user_info_handler.is_valid_user.mockImplementation(() => true);
        roomHandler.get_room_persistence().generate_new_room.mockImplementation(() => {
            throw new Error("Sample db error");
        });
        req.body = { id: "test@gmail.com", rm: "room1" };

        await roomHandler.create_room(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });
});

describe("Unit test for adding roommate", () => {
    let roomHandler;
    let req, res;

    beforeEach(() => {
        user_info_handler = new UserInfoHandler();
        roomHandler = new RoomHandler(user_info_handler);
        req = mockRequest();
        res = mockResponse();

        res.status = jest.fn().mockReturnValue(res); // Allows chaining like res.status(200).json()
        res.json = jest.fn();
        jest.clearAllMocks();
    });

    it("Send a success response verifying that the new roomate was successfully added to the room", async () => {
        // mock all required persistence
        roomHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            if (user_id === "test1@gmail.com") {
                return { user_id: "test1@gmail.com", room_id: "111-111" };
            } else {
                return { user_id: "test2@gmail.com", room_id: "111-111" };
            }
        });
        roomHandler.get_room_persistence().generate_new_room.mockImplementation((room_id, room_name, user_id) => {
            return "SUCCESS";
        });

        roomHandler.get_room_persistence().get_room_name.mockImplementation((room_id) => {
            return "Test_rm";
        });

        req.body = {
            existing_roommate: "test1@gmail.com",
            new_roommate: "test2@gmail.com",
            room_nm: "test_rm",
            notification_id: "111",
        };

        await roomHandler.add_roommate(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "New Roommate successfully added" });
    });

    it('Send a response signifying that the "existing " roommate doesn\'t live in that room anymore', async () => {
        // mock all required persistence
        roomHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            if (user_id === "test1@gmail.com") {
                return { user_id: "test1@gmail.com", room_id: "111-111" };
            } else {
                return { user_id: "test2@gmail.com", room_id: "111-111" };
            }
        });

        roomHandler.get_room_persistence().get_room_name.mockImplementation((room_id) => {
            return "different_room";
        });

        req.body = {
            existing_roommate: "test1@gmail.com",
            new_roommate: "test2@gmail.com",
            room_nm: "test_rm",
            notification_id: "111",
        };

        await roomHandler.add_roommate(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Room not found" });
    });

    it("Send a response signifying that the old roommate doesn't belong to a room", async () => {
        // mock all required persistence
        roomHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            if (user_id === "test1@gmail.com") {
                return { user_id: "test1@gmail.com" };
            } else {
                return { user_id: "test2@gmail.com", room_id: "111-111" };
            }
        });

        req.body = {
            existing_roommate: "test1@gmail.com",
            new_roommate: "test2@gmail.com",
            room_nm: "test_rm",
            notification_id: "111",
        };

        await roomHandler.add_roommate(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Room not found. Create or Join a room" });
    });

    it("Send a response verifying that both users don't exist", async () => {
        // mock all required persistence
        roomHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            return null;
        });

        req.body = {
            existing_roommate: "test1@gmail.com",
            new_roommate: "test2@gmail.com",
            room_nm: "test_rm",
            notification_id: "111",
        };

        await roomHandler.add_roommate(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Users not found" });
    });

    it("Send a response verifying that new roommate doesn't exist", async () => {
        // mock all required persistence
        roomHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            if (user_id === "test1@gmail.com") {
                return { user_id: "test1@gmail.com" };
            } else {
                return null;
            }
        });

        req.body = {
            existing_roommate: "test1@gmail.com",
            new_roommate: "test2@gmail.com",
            room_nm: "test_rm",
            notification_id: "111",
        };

        await roomHandler.add_roommate(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "New roommate not found" });
    });

    it("Send a response verifying that new roommate doesn't exist", async () => {
        // mock all required persistence
        roomHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            if (user_id === "test1@gmail.com") {
                return null;
            } else {
                return { user_id: "test2@gmail.com", room_id: "111-111" };
            }
        });

        req.body = {
            existing_roommate: "test1@gmail.com",
            new_roommate: "test2@gmail.com",
            room_nm: "test_rm",
            notification_id: "111",
        };

        await roomHandler.add_roommate(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "User in room not found" });
    });

    it("Send a response verifying that a server error occured", async () => {
        // mock all required persistence
        roomHandler.get_user_persistence().get_user.mockImplementation((user_id) => {
            throw new Error("Something has occured");
        });

        req.body = {
            existing_roommate: "test1@gmail.com",
            new_roommate: "test2@gmail.com",
            room_nm: "test_rm",
            notification_id: "111",
        };

        await roomHandler.add_roommate(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });
});

describe("Unit test for getting pending tasks", () => {
    let roomHandler;
    let req, res;

    beforeEach(() => {
        user_info_handler = new UserInfoHandler();
        roomHandler = new RoomHandler(user_info_handler);
        req = mockRequest();
        res = mockResponse();

        res.status = jest.fn().mockReturnValue(res); // Allows chaining like res.status(200).json()
        res.json = jest.fn();
        jest.clearAllMocks();
    });

    it("Send a success response verifying that successfully retrieved pending tasks", async () => {
        user_info_handler.is_valid_user.mockImplementation(() => true);
        roomHandler.get_user_persistence().get_room_id.mockImplementation(() => "sample_room_id");
        roomHandler.get_room_persistence().get_pending_tasks.mockImplementation(() => [
            {
                task_id: "task1",
                complete: false,
                due_date: "2024-11-14",
                assignee: "cam@gmail.com",
                task_description: "task 2",
            },
        ]);

        req.query = {
            frm: "test1@gmail.com",
        };

        // Call the method
        await roomHandler.get_pending_tasks(req, res);

        // Check if res.status and res.json were called with the correct arguments
        // expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            pending_tasks: [
                {
                    task_id: "task1",
                    complete: false,
                    due_date: "2024-11-14",
                    assignee: "cam@gmail.com",
                    task_description: "task 2",
                },
            ],
        });
    });

    it("Send a response signifying that Invalid User", async () => {
        // mock all required persistence
        req.query = {
            frm: "test1@gmail.com",
        };
        user_info_handler.is_valid_user.mockImplementation(() => false);

        await roomHandler.get_pending_tasks(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid user" });
    });

    it("Send a response signifying that Room not found", async () => {
        // mock all required persistence
        user_info_handler.is_valid_user.mockImplementation(() => true);
        roomHandler.get_user_persistence().get_room_id.mockImplementation(() => false);

        req.query = {
            frm: "test1@gmail.com",
        };

        await roomHandler.get_pending_tasks(req, res);
        // expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Room not found" });
    });

    it("Send a response verifying that No pending tasks found", async () => {
        user_info_handler.is_valid_user.mockImplementation(() => true);
        roomHandler.get_user_persistence().get_room_id.mockImplementation(() => true);

        // mock all required persistence
        roomHandler.get_room_persistence().get_pending_tasks.mockImplementation(() => []);
        req.query = {
            frm: "test1@gmail.com",
        };

        await roomHandler.get_pending_tasks(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "No pending tasks found" });
    });

    it("Send a response verifying that a server error occured", async () => {
        user_info_handler.is_valid_user.mockImplementation(() => true);
        roomHandler.get_user_persistence().get_room_id.mockImplementation(() => true);

        // mock all required persistence
        roomHandler.get_room_persistence().get_pending_tasks.mockImplementation((user_id) => {
            throw new Error("Something has occured");
        });

        req.query = {
            frm: "test1@gmail.com",
        };

        await roomHandler.get_pending_tasks(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });
});

describe("Unit test for getting completed tasks", () => {
    let roomHandler;
    let req, res;

    beforeEach(() => {
        user_info_handler = new UserInfoHandler();
        roomHandler = new RoomHandler(user_info_handler);
        req = mockRequest();
        res = mockResponse();

        res.status = jest.fn().mockReturnValue(res); // Allows chaining like res.status(200).json()
        res.json = jest.fn();
        jest.clearAllMocks();
    });

    it("Send a success response verifying that successfully retrieved completed tasks", async () => {
        user_info_handler.is_valid_user.mockImplementation(() => true);
        roomHandler.get_user_persistence().get_room_id.mockImplementation(() => "sample_room_id");
        roomHandler.get_room_persistence().get_completed_tasks.mockImplementation(() => [
            {
                task_id: "task1",
                complete: false,
                due_date: "2024-11-14",
                assignee: "cam@gmail.com",
                task_description: "task 2",
            },
        ]);

        req.query = {
            frm: "test1@gmail.com",
        };

        // Call the method
        await roomHandler.get_completed_tasks(req, res);

        // Check if res.status and res.json were called with the correct arguments
        // expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            completed_tasks: [
                {
                    task_id: "task1",
                    complete: false,
                    due_date: "2024-11-14",
                    assignee: "cam@gmail.com",
                    task_description: "task 2",
                },
            ],
        });
    });

    it("Send a response signifying that Invalid User", async () => {
        // mock all required persistence
        req.query = {
            frm: "test1@gmail.com",
        };
        user_info_handler.is_valid_user.mockImplementation(() => false);

        await roomHandler.get_completed_tasks(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid user" });
    });

    it("Send a response signifying that Room not found", async () => {
        // mock all required persistence
        user_info_handler.is_valid_user.mockImplementation(() => true);
        roomHandler.get_user_persistence().get_room_id.mockImplementation(() => false);

        req.query = {
            frm: "test1@gmail.com",
        };

        await roomHandler.get_completed_tasks(req, res);
        // expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Room not found" });
    });

    it("Send a response verifying that No completed tasks found", async () => {
        user_info_handler.is_valid_user.mockImplementation(() => true);
        roomHandler.get_user_persistence().get_room_id.mockImplementation(() => true);

        // mock all required persistence
        roomHandler.get_room_persistence().get_completed_tasks.mockImplementation(() => []);
        req.query = {
            frm: "test1@gmail.com",
        };

        await roomHandler.get_completed_tasks(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "No completed tasks found" });
    });

    it("Send a response verifying that a server error occured", async () => {
        user_info_handler.is_valid_user.mockImplementation(() => true);
        roomHandler.get_user_persistence().get_room_id.mockImplementation(() => true);

        // mock all required persistence
        roomHandler.get_room_persistence().get_completed_tasks.mockImplementation((user_id) => {
            throw new Error("Something has occured");
        });

        req.query = {
            frm: "test1@gmail.com",
        };

        await roomHandler.get_completed_tasks(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });
});
