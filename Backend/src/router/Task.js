/** Routes
 * @namespace Task
 * @description Routes related to tasks
 */
const express = require("express");
const router = express.Router();
const TaskHandler = require("../Handler/TaskHandler");
const userInfoHandler = require("../Handler/UserInfoHandler.js");
const task_handler = new TaskHandler(new userInfoHandler());

//CREATE A TASK

/**
 * @memberof Task
 * @name Add a new Task
 * @path {POST} /create-task
 * @body {String} tn The task name
 * @body {String} frm The user creating the task
 * @body {String} to The user assigned the task
 * @body {String} date The due date for the task(yyyy-mm-dd)
 * @code {200} Task created successfully
 * @code {403} Invalid users involved
 * @code {403} Users are not roommates
 * @code {403} Invalid task name or due date
 * @code {500} Error message from backend
 * @response {String} message See description of the different status codes
 */
router.post("/create-task", (req, res) => {
    task_handler.create_task(req, res);
});

//EDIT TASK

/**
 * @memberof Task
 * @name Edit an existing Task
 * @path {POST} /edit-task
 * @body {String} id The task ID
 * @body {String} tn The updated task name
 * @body {String} frm The user modifying the task
 * @body {String} to The new user assigned to the task
 * @body {String} date The updated due date for the task
 * @code {200} Task updated successfully
 * @code {403} Invalid users involved
 * @code {403} Users are not roommates
 * @code {403} Invalid task name or due date
 * @code {404} Task not found
 * @code {500} Error message from backend
 * @response {String} message See description of the different status codes
 */
router.post("/edit-task", (req, res) => {
    task_handler.edit_task(req, res);
});

//DELETE TASK

/**
 * @memberof Task
 * @name Delete an existing Task
 * @path {DELETE} /delete-task
 * @body {String} id The task ID
 * @body {String} frm The user requesting the deletion
 * @code {200} Task deleted successfully
 * @code {403} Invalid user
 * @code {404} Task not found
 * @code {500} Error message from backend
 * @response {String} message See description of the different status codes
 */
router.delete("/delete-task", (req, res) => {
    task_handler.delete_task(req, res);
});

//MARK TASK AS COMPLETED

/**
 * @memberof Task
 * @name Mark Task as Completed
 * @path {PATCH} /mark-completed
 * @body {String} id The task ID
 * @body {String} frm The user marking the task as completed
 * @code {200} Task marked as completed
 * @code {400} Invalid user
 * @code {403} Task not found
 * @code {500} Error message from backend
 * @response {String} message See description of the different status codes
 */
router.patch("/mark-completed", (req, res) => {
    task_handler.mark_completed(req, res);
});

router.use("/", (req, res) => {
    res.status(200).json({ message: "Welcome to the Task paths" });
});

module.exports = router;
