const app = require("../../../src/router/index");
const request = require("supertest");

jest.mock("../../../src/Handler/RoomHandler", () => {
    return jest.fn().mockImplementation(() => ({
        create_room: jest.fn().mockImplementation((req, res) => {
            res.status(200).json({ message: "Test Successful" });
        }),

        add_roommate: jest.fn().mockImplementation((req, res) => {
            res.status(200).json({ message: "Test Successful" });
        }),

        get_completed_tasks: jest.fn().mockImplementation((req, res) => {
            res.status(200).json({
                complete_tasks: [
                    {
                        complete: true,
                        due_date: "2024-11-11",
                        task_id: "2e047472",
                        asignee: "user1@gmail.com",
                        task_description: "washing dishes",
                    },
                    {
                        complete: true,
                        due_date: "2024-11-11",
                        task_id: "55e10ce7",
                        asignee: "user2@gmail.com",
                        task_description: "throw trash",
                    },
                ],
            });
        }),

        get_pending_tasks: jest.fn().mockImplementation((req, res) => {
            res.status(200).json({
                pending_tasks: [
                    {
                        complete: false,
                        due_date: "2024-11-15",
                        task_id: "7b23c541",
                        asignee: "user1@gmail.com",
                        task_description: "vacuum the floor",
                    },
                    {
                        complete: false,
                        due_date: "2024-11-18",
                        task_id: "8f60df82",
                        asignee: "user2@gmail.com",
                        task_description: "grocery shopping",
                    },
                ],
            });
        }),
    }));
});

describe("Room router tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("Post room/create-room should call the create_room function in room_handler", async () => {
        const query_params = {
            rm: "test_rm",
            id: "test@gmail.com",
        };
        const response = await request(app).post("/room/create-room").send(query_params);
        const exp_stat = 200;
        const exp_msg = { message: "Test Successful" };
        expect(response.status).toBe(exp_stat);
        expect(response.body).toEqual(exp_msg);
    });

    it("Post room/add-roommate should call the add_roommate method in the room_handler", async () => {
        const query_params = {
            existing_roommate: "test@gmail.com",
            new_roommate: "testnew@gmail.com",
            room_nm: "test_rm",
        };
        const response = await request(app).post("/room/add-roommate").send(query_params);
        const exp_stat = 200;
        const exp_msg = { message: "Test Successful" };
        expect(response.status).toBe(exp_stat);
        expect(response.body).toEqual(exp_msg);
    });

    it("Get room/get-completed-tasks should return a list of completed tasks", async () => {
        const query_params = { frm: "test@gmail.com" };
        const expectedResponse = {
            complete_tasks: [
                {
                    complete: true,
                    due_date: "2024-11-11",
                    task_id: "2e047472",
                    asignee: "user1@gmail.com",
                    task_description: "washing dishes",
                },
                {
                    complete: true,
                    due_date: "2024-11-11",
                    task_id: "55e10ce7",
                    asignee: "user2@gmail.com",
                    task_description: "throw trash",
                },
            ],
        };
        const response = await request(app).get("/room/get-completed-tasks").query(query_params);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expectedResponse);
    });

    it("Get room/get-pending-tasks should return a list of pending tasks", async () => {
        const query_params = { frm: "test@gmail.com" };
        const expectedResponse = {
            pending_tasks: [
                {
                    complete: false,
                    due_date: "2024-11-15",
                    task_id: "7b23c541",
                    asignee: "user1@gmail.com",
                    task_description: "vacuum the floor",
                },
                {
                    complete: false,
                    due_date: "2024-11-18",
                    task_id: "8f60df82",
                    asignee: "user2@gmail.com",
                    task_description: "grocery shopping",
                },
            ],
        };
        const response = await request(app).get("/room/get-pending-tasks").query(query_params);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expectedResponse);
    });
});
