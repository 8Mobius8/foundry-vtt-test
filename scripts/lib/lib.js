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

/**
 * The data layer for our todo-list module
 */
 class ToDoListData {
    /**
     * get all toDos for all users indexed by the todo's id
     */
    static get allToDos() {
      const allToDos = game.users.reduce((accumulator, user) => {
        const userTodos = this.getToDosForUser(user.id);
  
        return {
          ...accumulator,
          ...userTodos
        }
      }, {});
  
      return allToDos;
    }
  
    /**
     * Gets all of a given user's ToDos
     * 
     * @param {string} userId - id of the user whose ToDos to return
     * @returns {Record<string, ToDo> | undefined}
     */
    static getToDosForUser(userId) {
      return game.users.get(userId)?.getFlag(ToDoList.ID, ToDoList.FLAGS.TODOS);
    }
  
    /**
     * 
     * @param {string} userId - id of the user to add this ToDo to
     * @param {Partial<ToDo>} toDoData - the ToDo data to use
     */
    static createToDo(userId, toDoData) {
      // generate a random id for this new ToDo and populate the userId
      const newToDo = {
        isDone: false,
        label: '',
        ...toDoData,
        id: foundry.utils.randomID(16),
        userId,
      }
  
      // construct the update to insert the new ToDo
      const newToDos = {
        [newToDo.id]: newToDo
      }
  
      // update the database with the new ToDos
      return game.users.get(userId)?.setFlag(ToDoList.ID, ToDoList.FLAGS.TODOS, newToDos);
    }
  
    /**
     * Updates a given ToDo with the provided data.
     * 
     * @param {string} toDoId - id of the ToDo to update
     * @param {Partial<ToDo>} updateData - changes to be persisted
     */
    static updateToDo(toDoId, updateData) {
      const relevantToDo = this.allToDos[toDoId];
  
      // construct the update to send
      const update = {
        [toDoId]: updateData
      }
  
      // update the database with the updated ToDo list
      return game.users.get(relevantToDo.userId)?.setFlag(ToDoList.ID, ToDoList.FLAGS.TODOS, update);
    }
  
    /**
     * Deletes a given ToDo
     * 
     * @param {string} toDoId - id of the ToDo to delete
     */
    static deleteToDo(toDoId) {
      const relevantToDo = this.allToDos[toDoId];
  
      // Foundry specific syntax required to delete a key from a persisted object in the database
      const keyDeletion = {
        [`-=${toDoId}`]: null
      }
  
      // update the database with the updated ToDo list
      return game.users.get(relevantToDo.userId)?.setFlag(ToDoList.ID, ToDoList.FLAGS.TODOS, keyDeletion);
    }
  
    /**
     * Updates the given user's ToDos with the provided updateData. This is
     * useful for updating a single user's ToDos in bulk.
     * 
     * @param {string} userId - user whose todos we are updating
     * @param {object} updateData - data passed to setFlag
     * @returns 
     */
    static updateUserToDos(userId, updateData) {
      return game.users.get(userId)?.setFlag(ToDoList.ID, ToDoList.FLAGS.TODOS, updateData);
    }
  }