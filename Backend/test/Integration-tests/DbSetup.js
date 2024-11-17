const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

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

let working_client = new DynamoDBClient(local_test_client);
let doc_client = DynamoDBDocumentClient.from(working_client);
let table_name = "room";

async function populate_db() {
    try {
        // adding users
        const put_command_user = new PutCommand({
            TableName: "User",
            Item: {
                user_id: "test@gmail.com",
                notification: new Set(["123", "456", "delete_req"]),
                room_id: "rm_11",
            },
        });

        const put_command_user2 = new PutCommand({
            TableName: "User",
            Item: {
                user_id: "test2@gmail.com",
            },
        });
        const put_command_user3 = new PutCommand({
            TableName: "User",
            Item: {
                user_id: "test11@gmail.com",
            },
        });
        await doc_client.send(put_command_user);
        await doc_client.send(put_command_user2);
        await doc_client.send(put_command_user3);

        //adding rooms
        const put_command_room = new PutCommand({
            TableName: "Room",
            Item: {
                room_id: "rm_11",
                name: "test_room1",
                users: new Set(["test@gmail.com"]),
                tasks: ["task1", "task2", "task4"],
            },
        });

        const put_command_room2 = new PutCommand({
            TableName: "Room",
            Item: {
                room_id: "rm_bad",
            },
        });

        const put_command_room3 = new PutCommand({
            TableName: "Room",
            Item: {
                room_id: "rm_3",
                name: "test_room1",
                users: new Set(["test@gmail.com"]),
                tasks: null,
            },
        });

        await doc_client.send(put_command_room);
        await doc_client.send(put_command_room2);
        await doc_client.send(put_command_room3);

        // adding notifications
        const put_command_notification = new PutCommand({
            TableName: "Notification",
            Item: {
                id: "123",
                from: "test@gmail.com",
                to: "test2@gmail.com",
                message: "abc invite bcd",
                room_id: "rm_11",
                status: "unread",
                type: "invite",
            },
        });
        const put_command_notification2 = new PutCommand({
            TableName: "Notification",
            Item: {
                id: "456",
                from: "test11@gmail.com",
                to: "test@gmail.com",
                message: "",
                room_id: "rm_bad",
                status: "unread",
                type: "invite",
            },
        });

        const put_command_notification3 = new PutCommand({
            TableName: "Notification",
            Item: {
                id: "delete_req",
            },
        });
        await doc_client.send(put_command_notification);
        await doc_client.send(put_command_notification2);
        await doc_client.send(put_command_notification3);

        const put_command_task = new PutCommand({
            TableName: "Task",
            Item: {
                task_id: "task1",
                task_description: "test_task1",
                due_date: "2024-11-19",
                asignee: "test@gmail.com",
                complete: false,
            },
        });

        const put_command_task2 = new PutCommand({
            TableName: "Task",
            Item: {
                task_id: "task2",
                task_description: "test_task2",
                due_date: "2024-11-19",
                asignee: "test@gmail.com",
                complete: true,
            },
        });
        const put_command_task3 = new PutCommand({
            TableName: "Task",
            Item: {
                task_id: "task3",
                task_description: "test_task3",
                due_date: "2024-11-19",
                asignee: "test@gmail.com",
                complete: false,
            },
        });
        const put_command_task4 = new PutCommand({
            TableName: "Task",
            Item: {
                task_id: "task4",
                task_description: "test_task4",
                due_date: "2024-11-19",
                asignee: "test@gmail.com",
                complete: false,
            },
        });

        await doc_client.send(put_command_task);
        await doc_client.send(put_command_task2);
        await doc_client.send(put_command_task3);
        await doc_client.send(put_command_task4);
    } catch (error) {
        throw new Error("Something went wrong " + error.message);
    }
}

// async function teardown_db() {}
module.exports = {
    populate_db,
};
