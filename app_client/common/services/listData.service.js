(() => {

  angular
    .module('trelloClone')
    .service('listData', listData);

  //CRUD requests for lists
  listData.$inject = ['$http', 'authentication'];
  function listData($http, authentication) {

    let createList = (boardid, listName) => {
      return $http.post(`/api/board/${boardid}/list`, listName, {
        headers: {
          Authorization: 'Bearer ' + authentication.getToken()
        }
      });
    };

    let updateList = (boardid, listid, newListName) => {
      return $http.put(`/api/board/${boardid}/list/${listid}`, newListName, {
        headers: {
          Authorization: 'Bearer ' + authentication.getToken()
        }
      });
    };

    let deleteList = (boardid, listid) => {
      return $http.delete(`/api/board/${boardid}/list/${listid}`, {
        headers: {
          Authorization: 'Bearer ' + authentication.getToken()
        }
      });

    };

    return {
      createList,
      updateList,
      deleteList
    }
  }

})();