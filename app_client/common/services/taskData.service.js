(() => {

  angular
    .module('trelloClone')
    .service('taskData', taskData);

  //CRUD requests for tasks
  taskData.$inject = ['$http', 'authentication'];
  function taskData($http, authentication) {

    let createTask = (boardid, listid, taskName) => {
      return $http.post(`/api/board/${boardid}/list/${listid}/task`, taskName, {
        headers: {
          Authorization: 'Bearer ' + authentication.getToken()
        }
      });
    };

    let updateTask = (boardid, listid, taskid, newTaskData) => {
      return $http.put(`/api/board/${boardid}/list/${listid}/task/${taskid}`, newTaskData, {
        headers: {
          Authorization: 'Bearer ' + authentication.getToken()
        }
      });
    };

    let deleteTask = (boardid, listid, taskid) => {
      return $http.delete(`/api/board/${boardid}/list/${listid}/task/${taskid}`, {
        headers: {
          Authorization: 'Bearer ' + authentication.getToken()
        }
      });
    };

    return {
      createTask,
      updateTask,
      deleteTask
    }
  }

})();