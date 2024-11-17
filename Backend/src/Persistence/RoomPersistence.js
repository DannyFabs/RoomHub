const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
require("dotenv").config();

/**
 * @module Persistence
 */

/**
 * Represents the room persistence layer that is linked to the room table in the database.
 * @class
 */
class RoomPersistence {
    // document client to dynamo db and table name to reference the table.
    /**
     * The connection with the dynamodb client
     * @type {DynamoDBClient}
     * @private
     */
    #doc_client;
    /**
     * The name of the user table in the backend
     * @type {string}
     * @private
     */
    #table_name;

    /**
     * Create a new RoomPersistence object
     * @constructor
     */
    constructor() {
        // check if test is running
        const isTest = process.env.JEST_WORKER_ID;

        const remote_client = {
            region: process.env.REGION,
            credentials: {
                accessKeyId: process.env.ACCESS_KEY_ID,
                secretAccessKey: process.env.SECRET_ACCESS_KEY,
            },
        };

        const local_test_client = {
            region: "local-env",
            endpoint: "http://localhost:8000",
            sslEnabled: false,
            convertEmptyValues: true,
            credentials: {
                accessKeyId: "fakeMyKeyId", // Dummy key
                secretAccessKey: "fakeSecretAccessKey", // Dummy secret
            },
        };

        let working_client;
        if (isTest) {
            working_client = new DynamoDBClient(local_test_client);
        } else {
            working_client = new DynamoDBClient(remote_client);
        }

        // working_client = new DynamoDBClient(local_test_client);

        this.#doc_client = DynamoDBDocumentClient.from(working_client, {
            marshallOptions: { convertEmptyValues: true },
        });
        this.#table_name = "room";
    }

    get_doc_client() {
        return this.#doc_client;
    }

    get_table_name() {
        return this.#table_name;
    }

    /**
     * Use Get command to get the room name from Room table
     * @param {String} room_id "The unique identifier for the room"
     * @returns {String} "The roomname associated with the room_id"
     */
    async get_room_name(room_id) {
        const get_command = new GetCommand({
            TableName: "Room",
            Key: {
                room_id: room_id,
            },
        });
        const response = await this.#doc_client.send(get_command);

        let room_name = response.Item.name;
        if (room_name === undefined) {
            throw new Error("Room doesn't have a name--Service Unavailable");
        }
        return room_name;
    }

    /**
     * Use Put command to create the new room into Room table
     * @param {String} unique_id "The unique identifier for the room"
     * @param {String} room_name "The room name as defined by user or function caller"
     * @param {String} user_id "Id of user belonging to the room."
     * @returns {String} "SUCCESS OR FAILURE - if the db write succeeded or failed."
     */
    async generate_new_room(unique_id, room_name, user_id) {
        try {
            // add the new user
            const put_command = new PutCommand({
                TableName: "Room",
                Item: {
                    room_id: unique_id,
                    name: room_name,
                    users: new Set([user_id]),
                    tasks: [],
                },
                ConditionExpression: "attribute_not_exists(room_id)",
            });
            await this.#doc_client.send(put_command);
            return "SUCCESS";
        } catch (error) {
            if (error.name === "ConditionalCheckFailedException") {
                return "FAILED";
            } else {
                throw error;
            }
        }
    }

    /**
     * Use update command to add a new user to the set of users "belonging" to a room.
     * @param {String} room_id "The unique id of a room"
     * @param {String} new_roommate_id "The unique id of a user(new roommate)"
     */
    async add_new_roommate(room_id, new_roommate_id) {
        const update_command = new UpdateCommand({
            TableName: "Room",
            Key: {
                room_id: room_id,
            },
            UpdateExpression: "ADD #roommates :newRoommate",
            ExpressionAttributeNames: {
                "#roommates": "users", // The attribute (field) you're updating
            },
            ExpressionAttributeValues: {
                ":newRoommate": new Set([new_roommate_id]), // The new values to add to the set
            },
            ReturnValues: "NONE",
        });
        await this.#doc_client.send(update_command);
    }

    /**
     * Use Get command to get the list of users from the given room
     * @param {String} room_id "The unique identifier for the room"
     * @returns {Set} "The list of users associated with the room_id"
     */
    async get_room_users(room_id) {
        const get_command = new GetCommand({
            TableName: "Room",
            Key: {
                room_id: room_id,
            },
        });
        const response = await this.#doc_client.send(get_command);

        let user_list = response.Item.users;
        if (user_list === undefined) {
            throw new Error("Room doesn't have an user--Service Unavailable");
        }
        return user_list;
    }

    /**
     * Use Delete command to delete the specific room given room_id from Room table
     * @param {String} room_id "The unique identifier for the room"
     */
    async delete_room(room_id) {
        const delete_command = new DeleteCommand({
            TableName: "Room",
            Key: {
                room_id: room_id,
            },
        });
        await this.#doc_client.send(delete_command);
    }

    /**
     * Use Update command to delete specific user from specific room
     * @param {String} user_id "The unique identifier for the user"
     * @param {String} room_id "The unique identifier for the room"
     */
    async remove_user_id(user_id, room_id) {
        const update_command = new UpdateCommand({
            TableName: "Room",
            Key: {
                room_id: room_id,
            },
            UpdateExpression: "DELETE #users :user_id",
            ExpressionAttributeNames: {
                "#users": "users",
            },
            ExpressionAttributeValues: {
                ":user_id": new Set([user_id]),
            },
            ConditionExpression: "attribute_exists(room_id)",
            ReturnValues: "NONE",
        });

        await this.#doc_client.send(update_command);
    }

    /**
     * Use Update command to add a new task to the list of tasks for a specific room.
     * @param {String} room_id "The unique identifier for the room"
     * @param {Object} task "The task object to be added to the room"
     */
    async add_task_to_room(room_id, task) {
        const update_command = new UpdateCommand({
            TableName: "Room",
            Key: {
                room_id: room_id,
            },
            UpdateExpression: "SET #tasks = list_append(#tasks, :new_task)",
            ExpressionAttributeNames: {
                "#tasks": "tasks", // The attribute (field) you're updating
            },
            ExpressionAttributeValues: {
                ":new_task": [task], // The new task to add as a single-element list
            },
            ConditionExpression: "attribute_exists(room_id)",
        });

        try {
            await this.#doc_client.send(update_command);
            return "SUCCESS";
        } catch (error) {
            console.error("Adding task to a room failed:", error);
            return "FAILURE";
        }
    }

    /**
     * Use Get command to retrieve the list of pending (incomplete) tasks associated with a specific room.
     * @param {String} room_id "The unique identifier for the room"
     * @returns {Array} "The list of tasks where complete = false"
     */
    async get_pending_tasks(room_id) {
        const pending_tasks = [];
        // Step 1: Get the task IDs from the room
        const get_command = new GetCommand({
            TableName: "Room",
            Key: {
                room_id: room_id,
            },
            ProjectionExpression: "tasks",
        });
        try {
            const response = await this.#doc_client.send(get_command);
            // Retrieve task IDs or initialize to an empty array if tasks is undefined
            const task_ids = response.Item?.tasks ? [...response.Item.tasks] : [];
            // Step 4: Fetch each task's details
            for (const task_id of task_ids) {
                const task_command = new GetCommand({
                    TableName: "Task", // Assuming tasks are stored in a separate table named "Task"
                    Key: {
                        task_id: task_id, // Assuming task_id is the primary key in the "Task" table
                    },
                });
                console.log(task_id);
                const task_response = await this.#doc_client.send(task_command);
                // Only add the task if it is incomplete
                if (task_response.Item && task_response.Item.complete === false) {
                    pending_tasks.push(task_response.Item); // Add to pending tasks if complete is false
                }
            }
            return pending_tasks.sort((a, b) => a.due_date.localeCompare(b.due_date)); // Return the list of sorted pending tasks
        } catch (error) {
            console.error("Error getting pending tasks:", error);
            throw error;
            //return [];
        }
    }

    /**
     * Use Get command to retrieve the list of complete tasks associated with a specific room.
     * @param {String} room_id "The unique identifier for the room"
     * @returns {Array} "The list of tasks where complete = false"
     */
    async get_completed_tasks(room_id) {
        const completed_tasks = [];
        // Step 1: Get the task IDs from the room
        const get_command = new GetCommand({
            TableName: "Room",
            Key: {
                room_id: room_id,
            },
            ProjectionExpression: "tasks",
        });
        try {
            const response = await this.#doc_client.send(get_command);

            // Retrieve task IDs or initialize to an empty array if tasks is undefined
            const task_ids = response.Item?.tasks ? [...response.Item.tasks] : [];

            // Step 4: Fetch each task's details
            for (const task_id of task_ids) {
                const task_command = new GetCommand({
                    TableName: "Task", // Assuming tasks are stored in a separate table named "Task"
                    Key: {
                        task_id: task_id, // Assuming task_id is the primary key in the "Task" table
                    },
                });
                const task_response = await this.#doc_client.send(task_command);
                // Only add the task if it is incomplete
                if (task_response.Item && task_response.Item.complete === true) {
                    completed_tasks.push(task_response.Item); // Add to pending tasks if complete is false
                }
            }
            return completed_tasks.sort((a, b) => a.due_date.localeCompare(b.due_date)); // Return the list of sorted pending tasks
        } catch (error) {
            console.error("Error getting pending tasks:", error);
            throw error;
            //return [];
        }
    }

    async delete_task_from_room(room_id, task_id) {
        const update_command = new UpdateCommand({
            TableName: "Room",
            Key: {
                room_id: room_id,
            },
            UpdateExpression: "DELETE #tasks :taskToRemove",
            ExpressionAttributeNames: {
                "#tasks": "tasks",
            },
            ExpressionAttributeValues: {
                ":taskToRemove": new Set([task_id]),
            },
            ConditionExpression: "attribute_exists(tasks)",
        });

        try {
            await this.#doc_client.send(update_command);
            return "SUCCESS";
        } catch (error) {
            console.error("Error deleting task from room:", error);
            return "FAILURE";
        }
    }
}

module.exports = RoomPersistence;
