// Base URL for the API
const url = 'https://7hm4udd9s2.execute-api.ca-central-1.amazonaws.com/dev/';

// Endpoints for user-related API requests
const user = "${url}user"; // Base endpoint for user
const room = "${url}room"; // Base endpoint for room
const notification = "${url}notification";// Base endpoint for notification
const task = "${url}task";
const transaction = "${url}transaction";
// GET requests
// Endpoint to get user notifications
// final getNotification = user/:id/get-notification

// Endpoint to get the room associated with a user
// final getusersroom = user/:id/get-room

// POST requests
const joinRoom = "${url}notification/join-room-request"; // Endpoint to send a join room request
const signup = "$user/add-user"; // Endpoint to sign up a new user
const addRoommate =
    "$room/add-roommate"; // Endpoint to add a roommate to an existing room
const createRoom = "$room/create-room"; // Endpoint to create a new room
const leaveRoomWarning ="/leave-warning";//endpoint to get warning associated with leaving a room.
const sendAnnouncementPth = "$notification/send-announcement";//endpoint to send an announcement
const leaveRoomPth = "/leave-room"; //endpoint to leave a room
const getRoommatePth = "/get-roommate";//endpoint to get message whether or not  the user has roommates
const createTaskPth = "$task/create-task";
const getPendingTasks = "$room/get-pending-tasks";
const getCompletedTasks = "$room/get-completed-tasks";
const getRoommatesList = "get-user-roommates";
const markComplete = "$task/mark-completed";
const deleteTask = "$task/delete-task";
const editTaskPth = "$task/edit-task";
const createExpensePth = "$transaction/create-expense";
const settleUpPth = "$transaction/settle-up";
const getTransactionPth = "$transaction/get-transaction";
const getSummaryPth = "$transaction/get-summary";