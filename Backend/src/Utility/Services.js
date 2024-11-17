/**
 * All services to access the different persistence objects
 * @module Services
 */

// userpersistence object-- to get access to all the methods
const UserPersistence = require("../Persistence/UserPersistence");
const RoomPersistence = require("../Persistence/RoomPersistence");
const NotificationPersistence = require("../Persistence/NotificationPersistence");
const TaskPersistence = require("../Persistence/TaskPersistence");

/**
 * Services to make sure only one instance of different persistence exist.
 * @class
 */
class Services {
    // only one instance of the all persistence is created
    static #user_persistence = null;
    static #room_persistence = null;
    static #notification_persistence = null;
    static #task_persistence = null;

    static get_user_persistence() {
        if (this.#user_persistence === null) {
            this.#user_persistence = new UserPersistence();
        }

        return this.#user_persistence;
    }

    static get_room_persistence() {
        if (this.#room_persistence === null) {
            this.#room_persistence = new RoomPersistence();
        }

        return this.#room_persistence;
    }

    static get_notification_persistence() {
        if (this.#notification_persistence === null) {
            this.#notification_persistence = new NotificationPersistence();
        }

        return this.#notification_persistence;
    }

    static get_task_persistence() {
        if (this.#task_persistence === null) {
            this.#task_persistence = new TaskPersistence();
        }
        return this.#task_persistence;
    }
}

module.exports = Services;
