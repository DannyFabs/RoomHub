const Services = require("../Utility/Services");
const { v4: uuidv4 } = require("uuid");
const UserInfoHandler = require("./UserInfoHandler");

/**
 * @module Handler
 */

/**
 * Represents the Room handler
 * @class
 *
 */
class TaskOrganizerHandler {
    /**
     * The task persistence object used by the room handler.
     * @type {string}
     * @private
     */
    #task_persistence;
    /**
     * The user persistence object used by the info handler.
     * @type {string}
     * @private
     */
    #user_persistence;
    /**
     * The user persistence object used by the info handler.
     * @type {string}
     * @private
     */
    #room_persistence;

    userHandler;
    /**
     * @constructor
     */
    constructor(userHandler) {
        this.#user_persistence = Services.get_user_persistence();
        this.#task_persistence = Services.get_task_persistence();
        this.#room_persistence = Services.get_room_persistence();
        this.userHandler = userHandler;
    }

    get_task_persistence() {
        return this.#task_persistence;
    }

    get_user_persistence() {
        return this.#user_persistence;
    }

    get_room_persistence() {
        return this.#room_persistence;
    }
    /** V A L I D A T O R S  */

    /**
     * Validate a task name.
     * @param {String} task_name "The task name to be validated"
     * @returns {Boolean} valid_name "True if valid task name and false otherwise"
     */
    #is_valid_task_name(task_name) {
        let valid_name = false;
        // Check if task_name is a non-empty string
        if (typeof task_name === "string" && task_name.length > 0) {
            valid_name = true;
        }
        return valid_name;
    }

    /**
     * Validate a date string.
     * @param {String} dateString "The date string to be validated in yyyy-MM-dd format"
     * @returns {Boolean} "True if valid date format and date is today or in the future, false otherwise"
     */
    #is_valid_date(dateString) {
        // Regular expression to validate the format (yyyy-MM-dd)
        const dateRegExp = /^\d{4}-\d{2}-\d{2}$/;
        // Check if the date string matches the yyyy-MM-dd format
        if (!dateRegExp.test(dateString)) {
            return false;
        }
        // Parse the date string to a JavaScript Date object
        const inputDate = new Date(dateString);

        // Check if the parsed date is valid
        if (isNaN(inputDate.getTime())) {
            return false;
        }
        // Get today's date in yyyy-MM-dd format (ignore time part)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set the time to 00:00:00 to only compare dates
        // Compare the input date with today's date
        return inputDate >= today; // Returns true if inputDate is today or in the future
    }

    /* T A S K       A C T I O N S */

    /**
     * Create a new task based on user input.
     * @param {request} request - The HTTP request object containing task details.
     * @param {response } response - The HTTP response object for sending responses.
     */
    async create_task(request, response) {
        try {
            const { tn, frm, to, date } = request.body;
            //print("create task");

            // Sanitize inputs by trimming whitespace and converting to lowercase where appropriate
            const task_name = tn.trim();
            const user_from = frm.trim().toLowerCase();
            const user_to = to.trim().toLowerCase();
            const due_date = date.trim();
            const room_id = await this.#user_persistence.get_room_id(user_from);
            //print(user_from);

            // Validate inputs
            const is_valid_task = this.#is_valid_task_name(task_name);
            const is_valid_from = await this.userHandler.is_valid_user(user_from);
            const is_valid_to = await this.userHandler.is_valid_user(user_to);
            const is_valid_date = await this.#is_valid_date(due_date);

            // Check if task can be created
            if (!is_valid_from || !is_valid_to) {
                return response.status(403).json({ message: "Invalid users involved" });
            }

            if (!this.userHandler.areRoommates(user_from, user_to)) {
                return response.status(403).json({ message: "Users are not roommates" });
            }
            if (!is_valid_task || !is_valid_date) {
                return response.status(403).json({ message: "Invalid task name or due date" });
            }

            // Generate a unique task ID
            const task_id = uuidv4();
            await this.#task_persistence.generate_new_task(task_id, task_name, user_to, due_date);

            // Add the newly created task to the room
            await this.#room_persistence.add_task_to_room(room_id, task_id);

            return response.status(200).json({ message: "Task created successfully" });
        } catch (error) {
            console.error("Error creating task:", error);
            return response.status(500).json({ message: "An error occurred while creating the task" });
        }
    }

    /**
     * Delete a task based on task ID and user information.
     * @param {request}  - The HTTP request object containing task ID and user ID.
     * @param {response } - The HTTP response object for sending responses.
     */
    async delete_task(request, response) {
        try {
            const { id, frm } = request.body;
            const task_id = id.trim().toLowerCase();
            // Sanitize inputs
            const user_id = frm.trim().toLowerCase();
            // Check if the user is valid
            const is_valid_from = await this.userHandler.is_valid_user(user_id);
            if (!is_valid_from) {
                return response.status(403).json({ message: "Invalid user" });
            }
            // Get room ID from the user
            const room_id = await this.#user_persistence.get_room_id(user_id);
            const task_list = await this.#room_persistence.get_completed_tasks(room_id);

            // Fetch the existing task by task_id to ensure it exists
            // const existing_task = await this.#task_persistence.get_task_by_id(task_id);
            // if (existing_task === "FAILURE") {
            //     return response.status(404).json({ message: "Task not found" });
            // }

            // Check if the list includes the task
            if (!task_list.some((task) => task.task_id === task_id)) {
                return response.status(404).json({ message: "Task not found" });
            }
            // Remove the task from the room and delete it from the database
            await this.#room_persistence.delete_task_from_room(room_id, task_id);
            await this.#task_persistence.delete_task(task_id);
            return response.status(200).json({ message: "Task deleted successfully" });
        } catch (error) {
            console.error("Error deleting task:", error);
            return response.status(500).json({ message: "An error occurred while deleting the task" });
        }
    }

    /**
     * Edit an existing task based on user input.
     * @param {request} - The HTTP request object containing task details.
     * @param {response }- The HTTP response object for sending responses.
     */
    async edit_task(request, response) {
        try {
            const { id, tn, frm, to, date } = request.body;
            // Sanitize inputs
            const task_id = id.trim().toLowerCase();
            const task_name = tn.trim();
            const user_from = frm.trim().toLowerCase();
            const user_to = to.trim().toLowerCase();
            const due_date = date.trim();

            const is_valid_task = this.#is_valid_task_name(task_name);
            const is_valid_from = await this.userHandler.is_valid_user(user_from);
            const is_valid_to = await this.userHandler.is_valid_user(user_to);
            const is_valid_date = this.#is_valid_date(due_date);

            if (!is_valid_from || !is_valid_to) {
                return response.status(403).json({ message: "Invalid users involved" });
            }

            if (!this.userHandler.areRoommates(user_from, user_to)) {
                return response.status(403).json({ message: "Users are not roommates" });
            }

            if (!is_valid_task || !is_valid_date) {
                return response.status(403).json({ message: "Invalid task name or due date" });
            }

            // Fetch the existing task by task_id
            await this.#task_persistence.get_task_by_id(task_id);
            await this.#task_persistence.get_task_by_id(task_id);

            await this.#task_persistence.update_task(task_id, task_name, user_to, due_date);
            return response.status(200).json({ message: "Task updated successfully" });
        } catch (error) {
            console.error("Error updating task:", error);
            return response.status(500).json({ message: "An error occurred while updating the task" });
        }
    }

    /**
     * Mark a task as completed based on task ID and user information.
     * @param {request}  The HTTP request object containing task ID and user ID.
     * @param {response } - The HTTP response object for sending responses.
     */
    async mark_completed(request, response) {
        try {
            const { id, frm } = request.body;
            // Sanitize inputs
            const task_id = id.trim().toLowerCase();
            const user_id = frm.trim().toLowerCase();
            //get room id from the user
            // Check if the user is valid
            const is_valid_user = await this.userHandler.is_valid_user(user_id);
            if (!is_valid_user) {
                return response.status(403).json({ message: "Invalid user" });
            }
            const room_id = await this.#user_persistence.get_room_id(user_id);
            const task_list = await this.#room_persistence.get_pending_tasks(room_id);
            console.log(task_list);

            // Check if the task is in pending tasks in the room
            if (!task_list.some((task) => task.task_id === task_id)) {
                return response.status(404).json({ message: "Task not found" });
            }

            // // Fetch the existing task by task_id
            // const existing_task = await this.#task_persistence.get_task_by_id(task_id);
            // if (existing_task === "FAILURE") {
            //     return response.status(404).json({ message: "Task not found" });
            // }

            // Update task with new values
            let mark_completed = await this.#task_persistence.mark_completed(task_id);
            if (mark_completed === "SUCCESS") {
                return response.status(200).json({ message: "Task marked as completed" });
            } else {
                return response.status(500).json({ message: "An error occurred while updating the task" });
            }
        } catch (error) {
            console.error("Error updating task:", error);
            return response.status(500).json({ message: "An error occurred while updating the task" });
        }
    }
}

module.exports = TaskOrganizerHandler;
