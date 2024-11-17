require("dotenv").config(); // Load environment variables
const RoomPersistence = require("../../src/Persistence/RoomPersistence");
const { populate_db } = require("./DbSetup");

describe("RoomPersistence Class-- Getting a room name", () => {
    let room_persistence;
    let room_id;
    let no_name_room_id;

    beforeAll(async () => {
        // initialize the userHandlerobject
        room_persistence = new RoomPersistence();
        room_id = "rm_11";
        no_name_room_id = "rm_bad";
        await populate_db();
    });

    it("Should retrieve a valid room name", async () => {
        result = await room_persistence.get_room_name(room_id);
        expect(result).toBe("test_room1");
    });

    it("Should throw an error because the room doesn't have a name--(This case should be impossible)", async () => {
        await expect(room_persistence.get_room_name(no_name_room_id)).rejects.toThrow(
            "Room doesn't have a name--Service Unavailable",
        );
    });
});

describe("RoomPersistence Class-- Creating a new room", () => {
    let room_persistence;
    let room_id;
    let no_name_room_id;

    beforeAll(async () => {
        // initialize the userHandlerobject
        room_persistence = new RoomPersistence();
        room_id = "rm_11";
        no_name_room_id = "rm_bad";
        await populate_db();
    });

    it("Should return SUCCESS- signifying the room is successfully created ", async () => {
        result = await room_persistence.generate_new_room("rm_12", "test_room2", "test2@gmail.com");
        expect(result).toBe("SUCCESS");
    });

    it("Should return FAILED- signifying the room is was not successfully created ", async () => {
        result = await room_persistence.generate_new_room("rm_12", "test_room2", "test2@gmail.com");
        expect(result).toBe("FAILED");
    });
});

describe("RoomPersistence Class-- Adding a new roommmate", () => {
    let room_persistence;

    beforeAll(async () => {
        // initialize the userHandlerobject
        room_persistence = new RoomPersistence();
        await populate_db();
    });

    it("Should not throw an error- Signifies successful list of roomates update ", async () => {
        await expect(room_persistence.add_new_roommate("rm_11", "test11@gmail.com")).resolves.not.toThrow();
    });

    // check what update command does.
    // it("Should throw an error- Signifies an error from the backend", async () => {
    //     await expect(room_persistence.add_new_roommate("rm_notexist", "test11@gmail.com")).rejects.toThrow();
    // });
});

describe("RoomPersistence Class -- Getting room users", () => {
    let room_persistence;
    let room_id = "rm_11",
        room_fk = "rm_bad";

    beforeAll(async () => {
        // initialize the userHandlerobject
        room_persistence = new RoomPersistence();
        await populate_db();
    });

    it("Should not throw an error-Should return a list of users", async () => {
        let result = await room_persistence.get_room_users(room_id);
        expect(result).toEqual(new Set(["test@gmail.com"]));
    });

    it("Should throw an error", async () => {
        await expect(room_persistence.get_room_users(room_fk)).rejects.toThrow();
    });
});

describe("RoomPersistence Class-- Delete a room", () => {
    let room_persistence;
    let room_id = "rm_bad";

    beforeAll(async () => {
        room_persistence = new RoomPersistence();
        await populate_db();
    });

    it("Should not throw an error- Signifies successful deletion ", async () => {
        await expect(room_persistence.delete_room(room_id)).resolves.not.toThrow();
    });
});

describe("RoomPersistence Class-- Delete a user from a room", () => {
    let room_persistence;
    let room_id = "rm_3",
        user_id = "test@gmail.com";
    beforeAll(async () => {
        room_persistence = new RoomPersistence();
        await populate_db();
    });
    it("Should not throw an error- Signifies successful deletion ", async () => {
        await expect(room_persistence.remove_user_id(user_id, room_id)).resolves.not.toThrow();
    });
});

describe("RoomPersistence Class-- Adding a new task", () => {
    let room_persistence;
    let room_id = "rm_11",
        task = {
            task_id: "task3",
            task_description: "test_task3",
            due_date: "2024-11-19",
            asignee: "test@gmail.com",
            complete: false,
        };

    beforeAll(async () => {
        room_persistence = new RoomPersistence();
        await populate_db();
    });

    it("Should not throw an error- Signifies successful addition ", async () => {
        await expect(room_persistence.add_task_to_room(room_id, task)).resolves.not.toThrow();
    });
});

describe("RoomPersistence Class -- Getting pending tasks", () => {
    let room_persistence;
    let room_id = "rm_11",
        room_fk = "rm_3";

    beforeAll(async () => {
        // initialize the userHandlerobject
        room_persistence = new RoomPersistence();
        await populate_db();
    });

    it("Should return a list of pending tasks", async () => {
        let result = await room_persistence.get_pending_tasks(room_id);
        expect(result).toEqual([
            {
                task_id: "task1",
                task_description: "test_task1",
                due_date: "2024-11-19",
                asignee: "test@gmail.com",
                complete: false,
            },
            {
                task_id: "task4",
                task_description: "test_task4",
                due_date: "2024-11-19",
                asignee: "test@gmail.com",
                complete: false,
            },
        ]);
    });

    it("Should return an error that user doesn't have pending tasks", async () => {
        let result = await room_persistence.get_pending_tasks(room_fk);
        expect(result).toEqual([]);
    });
});

describe("RoomPersistence Class -- Getting complete tasks", () => {
    let room_persistence;
    let room_id = "rm_11",
        room_fk = "rm_3";

    beforeAll(async () => {
        // initialize the userHandlerobject
        room_persistence = new RoomPersistence();
        await populate_db();
    });

    it("Should return a list of complete tasks", async () => {
        let result = await room_persistence.get_completed_tasks(room_id);
        expect(result).toEqual([
            {
                task_id: "task2",
                task_description: "test_task2",
                due_date: "2024-11-19",
                asignee: "test@gmail.com",
                complete: true,
            },
        ]);
    });

    it("Should return an error that user doesn't have complete tasks", async () => {
        let result = await room_persistence.get_completed_tasks(room_fk);
        expect(result).toEqual([]);
    });
});

describe("RoomPersistence Class-- Delete a task", () => {
    let room_persistence;
    let room_id = "rm_11",
        task_id = "task1";
    beforeAll(async () => {
        room_persistence = new RoomPersistence();
        await populate_db();
    });
    it("Should not throw an error- Signifies successful deletion ", async () => {
        await expect(room_persistence.delete_task_from_room(room_id, task_id)).resolves.not.toThrow();
    });
});
