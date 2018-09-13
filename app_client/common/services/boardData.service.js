(() => {

  angular
    .module('trelloClone')
    .service('boardData', boardData);

  //CRUD requests for board
  boardData.$inject = ['$http', 'authentication'];
  function boardData($http, authentication) {

    let board = () => {
      return $http.get('/api/board');
    };

    let updateBoard = (boardid, newBoardData) => {
      return $http.put(`/api/board/${boardid}/lists`, newBoardData, {
        headers: {
          Authorization: 'Bearer ' + authentication.getToken()
        }
      });

    };

    return {
      board,
      updateBoard
    }
  }

})();