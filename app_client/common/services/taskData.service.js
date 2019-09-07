(() => {
  // eslint-disable-next-line no-use-before-define,no-undef
  angular.module('trelloClone').service('taskData', taskData);

  // CRUD requests for tasks
  // eslint-disable-next-line no-use-before-define
  taskData.$inject = ['$http', 'authentication'];
  function taskData($http, authentication) {
    const createTask = (boardid, listid, taskName) => {
      return $http.post(`/api/board/${boardid}/list/${listid}/task`, taskName, {
        headers: {
          Authorization: `Bearer ${authentication.getToken()}`,
        },
      });
    };

    const updateTask = (boardid, listid, taskid, newTaskData) => {
      return $http.put(
        `/api/board/${boardid}/list/${listid}/task/${taskid}`,
        newTaskData,
        {
          headers: {
            Authorization: `Bearer ${authentication.getToken()}`,
          },
        }
      );
    };

    const deleteTask = (boardid, listid, taskid) => {
      return $http.delete(
        `/api/board/${boardid}/list/${listid}/task/${taskid}`,
        {
          headers: {
            Authorization: `Bearer ${authentication.getToken()}`,
          },
        }
      );
    };

    return {
      createTask,
      updateTask,
      deleteTask,
    };
  }
})();
