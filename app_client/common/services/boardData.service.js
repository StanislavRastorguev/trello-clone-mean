(() => {
  // eslint-disable-next-line no-use-before-define,no-undef
  angular.module('trelloClone').service('boardData', boardData);

  // CRUD requests for board
  // eslint-disable-next-line no-use-before-define
  boardData.$inject = ['$http', 'authentication'];
  function boardData($http, authentication) {
    const board = () => {
      return $http.get('/api/board');
    };

    const updateBoard = (boardid, newBoardData) => {
      return $http.put(`/api/board/${boardid}/lists`, newBoardData, {
        headers: {
          Authorization: `Bearer ${authentication.getToken()}`,
        },
      });
    };

    return {
      board,
      updateBoard,
    };
  }
})();
