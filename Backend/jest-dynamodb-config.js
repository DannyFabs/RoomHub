module.exports = {
    tables: [
        {
            TableName: `User`,
            KeySchema: [{ AttributeName: "user_id", KeyType: "HASH" }],
            AttributeDefinitions: [{ AttributeName: "user_id", AttributeType: "S" }],
            ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
        },
        {
            TableName: `Room`,
            KeySchema: [{ AttributeName: "room_id", KeyType: "HASH" }],
            AttributeDefinitions: [{ AttributeName: "room_id", AttributeType: "S" }],
            ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
        },
        {
            TableName: `Notification`,
            KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
            AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
            ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
        },
        {
            TableName: `Task`,
            KeySchema: [{ AttributeName: "task_id", KeyType: "HASH" }],
            AttributeDefinitions: [{ AttributeName: "task_id", AttributeType: "S" }],
            ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
        },
    ],
};
