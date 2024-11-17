require("dotenv").config(); // Load environment variables
const TaskPersistence = require("../../src/Persistence/TaskPersistence");
const { populate_db } = require("./DbSetup");

describe("TaskPersistence Class-- Get task id", () => {
    let task_persistence;
    let task_id = "task1";
    let task_fk = "taskfk";

    beforeAll(async () => {
        // initialize the userHandlerobject
        task_persistence = new TaskPersistence();

        await populate_db();
    });
    it("Should retrieve a valid task", async () => {
        result = await task_persistence.get_task_by_id(task_id);
        expect(result).toEqual({
            task_id: "task1",
            task_description: "test_task1",
            due_date: "2024-11-19",
            asignee: "test@gmail.com",
            complete: false,
        });
    });
    it("Should return FAILURE- since the task doesn't exist", async () => {
        result = await task_persistence.get_task_by_id(task_fk);
        expect(result).toEqual("FAILURE");
    });
});
describe("TaskPersistence Class-- Edit task", () => {
    let task_persistence;
    let task_id;
    let task_fk = "taskfk";

    beforeAll(async () => {
        // initialize the userHandlerobject
        task_persistence = new TaskPersistence();
        task_id = "task1";
        await populate_db();
    });
    it("Should edit a valid task", async () => {
        await task_persistence.update_task(task_id, "new name", "test@gmail.com", "2025-01-01");
        result = await task_persistence.get_task_by_id(task_id);
        expect(result).toEqual({
            task_id: "task1",
            task_description: "new name",
            due_date: "2025-01-01",
            asignee: "test@gmail.com",
            complete: false,
        });
    });
    it("Should return FAILURE- since the task doesn't exist", async () => {
        result = await task_persistence.update_task(task_fk, "new name", "test@gmail.com", "2025-01-01");
        expect(result).toEqual("FAILURE");
    });
});
describe("TaskPersistence Class-- Generate tasks ", () => {
    let task_persistence;
    let unique_id = "task10";
    let bad_id = "task1";
    let task_description = "wash the car";
    let user_id = "test2@gmail.com";
    let due_date = "2024-12-01";

    beforeAll(async () => {
        task_persistence = new TaskPersistence();
        await populate_db();
    });

    it("Should return values that signify that the task is created", async () => {
        result = await task_persistence.generate_new_task(unique_id, task_description, user_id, due_date);
        expect(result).toBe("SUCCESS");
    });
    it("Should return a response that signifies that the task already exist", async () => {
        result = await task_persistence.generate_new_task(bad_id, task_description, user_id, due_date);
        expect(result).toBe("FAILURE");
    });
});
describe("TaskPersistence Class-- Mark as completed", () => {
    let task_persistence;
    let task_id;

    beforeAll(async () => {
        // initialize the userHandlerobject
        task_persistence = new TaskPersistence();
        task_id = "task1";
        await populate_db();
    });

    it("Should not throw error- meaning successful update to completed", async () => {
        await expect(task_persistence.mark_completed(task_id)).resolves.not.toThrow();
    });
});
describe("TaskPersistence Class-- Deleting a task", () => {
    let task_persistence;
    let task_id;

    beforeAll(async () => {
        // initialize the userHandlerobject
        task_persistence = new TaskPersistence();
        task_id = "task3";
        await populate_db();
    });
    it("Should return FAILURE- since if the task was deleted the task doesn't exist", async () => {
        await task_persistence.delete_task(task_id);
        result = await task_persistence.get_task_by_id(task_id);
        expect(result).toEqual("FAILURE");
    });
});
