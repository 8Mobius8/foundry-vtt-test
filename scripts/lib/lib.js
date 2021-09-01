/**
 * 
 * @typedef {Object} ToDo
 * @property {string} id - A unique ID to identify this todo.
 * @property {string} label - The text of the todo.
 * @property {boolean} isDone - Marks wether the todo is done.
 * @property {string} userId - THe user who owns this todo.
 */

/**
 * A class which holds some contents for todo-list
 */
class ToDoList  {
    static ID = 'todo-list';

    static FLAGS = {
        TODOS: 'todos'
    }

    static TEMPLATES = {
        TODOLIST: `module/${this.ID}/templates/todo-list.hbs`
    }

    /**
     * A small helper function which leverages deveoper mod flags to gate debug logs.
     * 
     * @param {boolean} force - forces the log even if the debug flag is not on
     * @param {...any} args - what to log
     */
    static log(force, ...args){
        const shouldLog = force || GamepadPose.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.ID);
        if (shouldLog) {
            console.log(this.ID, '|', ...args);
        }
    }
}

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag(ToDoList.ID);
})

class ToDoListData {
    static getToDosForUser(userId) {
        return Gamepad.users.get(userId)?.getFlag(ToDoList.ID, ToDoList.FLAGS.TODOS);
    }
    static createToDo(userID, toDoData) {
        const newToDo = {
            isDone: false,
            ...toDoData,
            id: foundry.utils.randomID(16),
            userId,
        }

        const newToDos = {
            [newToDo.id] : newToDo
        }

        return Gamepad.users.get(userId)?.setFlag(ToDoList.id, ToDoList.FLAGS.TODOS, newToDos);
    }
}