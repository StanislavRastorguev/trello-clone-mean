(() => {
  // eslint-disable-next-line no-undef,no-use-before-define
  angular.module('trelloClone').service('listData', listData);

  // CRUD requests for lists
  // eslint-disable-next-line no-use-before-define
  listData.$inject = ['$http', 'authentication'];
  function listData($http, authentication) {
    const createList = (boardid, listName) => {
      return $http.post(`/api/board/${boardid}/list`, listName, {
        headers: {
          Authorization: `Bearer ${authentication.getToken()}`,
        },
      });
    };

    const updateList = (boardid, listid, newListName) => {
      return $http.put(`/api/board/${boardid}/list/${listid}`, newListName, {
        headers: {
          Authorization: `Bearer ${authentication.getToken()}`,
        },
      });
    };

    const deleteList = (boardid, listid) => {
      return $http.delete(`/api/board/${boardid}/list/${listid}`, {
        headers: {
          Authorization: `Bearer ${authentication.getToken()}`,
        },
      });
    };

    return {
      createList,
      updateList,
      deleteList,
    };
  }
})();
