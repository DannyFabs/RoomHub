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
 * Represents the task persistence layer that is linked to the task table in the database.
 * @class
 */
class TaskPersistence {
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
     * Create a new taskPersistence object
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

        this.#doc_client = DynamoDBDocumentClient.from(working_client);
        this.#table_name = "Task";
    }

    get_doc_client() {
        return this.#doc_client;
    }

    get_table_name() {
        return this.#table_name;
    }

    /**
     *
     * @param {String} task_id "The unique identifier for the task"
     * @returns {Object} task "The task details from the database"
     */
    async get_task_by_id(task_id) {
        console.log(task_id);
        const get_command = new GetCommand({
            TableName: this.#table_name,
            Key: {
                task_id: task_id,
            },
        });

        const response = await this.#doc_client.send(get_command);
        if (!response.Item) {
            return "FAILURE";
        }
        return response.Item;
    }

    /**
     * Updates an existing task's details.
     * @param {String} task_id "The unique identifier for the task"
     * @param {String} task_name "The updated task name"
     * @param {String} user_to "The updated assignee"
     * @param {String} due_date "The updated due date"
     * @returns {String} "SUCCESS or FAILURE - whether the update was successful"
     */
    async update_task(task_id, task_name, user_to, due_date) {
        const update_command = new UpdateCommand({
            TableName: this.#table_name,
            Key: {
                task_id: task_id,
            },
            UpdateExpression:
                "set task_description = :task_name, asignee = :user_to, due_date = :due_date, complete = :complete",
            ExpressionAttributeValues: {
                ":task_name": task_name,
                ":user_to": user_to,
                ":due_date": due_date,
                ":complete": false, // Set complete to false on update
            },
            ConditionExpression: "attribute_exists(task_id)", // Ensure the task exists
            ReturnValues: "UPDATED_NEW",
        });

        try {
            await this.#doc_client.send(update_command);
            return "SUCCESS";
        } catch (error) {
            console.error("Update task failed:", error);
            return "FAILURE";
        }
    }

    /**
     *
     * @param {String} unique_id "The unique identifier for the room"
     * @param {String} task_name "The room name as defined by user or function caller"
     * @param {String} user_id "Id of user belonging to the room."
     * @returns {String} "SUCCESS OR FAILURE - if the db write succeeded or failed."
     */
    async generate_new_task(unique_id, task_description, user_id, due_date) {
        // Add the new task
        const put_command = new PutCommand({
            TableName: this.#table_name,
            Item: {
                task_id: unique_id,
                task_description: task_description,
                asignee: user_id,
                due_date: due_date,
                complete: false,
            },
            ConditionExpression: "attribute_not_exists(task_id)",
        });

        try {
            await this.#doc_client.send(put_command);
            return "SUCCESS";
        } catch (error) {
            console.error("Generate new task failed:", error);
            return "FAILURE";
        }
    }

    /**
     * Marks a task as completed by updating the `complete` attribute to true.
     * @param {String} task_id "The unique identifier for the task"
     * @returns {String} "SUCCESS or FAILURE - whether the update was successful"
     */
    async mark_completed(task_id) {
        const update_command = new UpdateCommand({
            TableName: this.#table_name,
            Key: {
                task_id: task_id,
            },
            UpdateExpression: "set complete = :completed",
            ExpressionAttributeValues: {
                ":completed": true, // Set complete to true
            },
            ConditionExpression: "attribute_exists(task_id)", // Ensure the task exists
            ReturnValues: "UPDATED_NEW",
        });

        try {
            await this.#doc_client.send(update_command);
            return "SUCCESS";
        } catch (error) {
            console.error("Mark task as completed failed:", error);
            return "FAILURE";
        }
    }

    /**
     * Deletes a task by its task_id.
     * @param {String} task_id "The unique identifier for the task"
     * @returns {String} "SUCCESS or FAILURE - whether the deletion was successful"
     */
    async delete_task(task_id) {
        const delete_command = new DeleteCommand({
            TableName: this.#table_name,
            Key: {
                task_id: task_id,
            },
        });
        try {
            await this.#doc_client.send(delete_command);
            return "SUCCESS";
        } catch (error) {
            console.error("Delete task failed:", error);
            return "FAILURE";
        }
    }
}

module.exports = TaskPersistence;
