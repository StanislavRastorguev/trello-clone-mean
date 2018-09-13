(() => {

  angular
    .module('trelloClone')
    .service('attachmentData', attachmentData);

  //CRUD requests for attachments
  attachmentData.$inject = ['$http', 'authentication'];
  function attachmentData($http, authentication) {

    let addAttachment = (boardid, listid, taskid, file, listName, taskName) => {
      let fd = new FormData();
      fd.append('listName', listName);
      fd.append('taskName', taskName);
      fd.append('attachmentFile', file);
      return $http.post(`/api/board/${boardid}/list/${listid}/task/${taskid}/attachments`, fd, {
        transformRequest: angular.identity,
        headers: {
          Authorization: 'Bearer ' + authentication.getToken(),
          'Content-Type': undefined
        }
      });
    };

    let deleteAttachment = (boardid, listid, taskid, attachmentid) => {
      return $http.delete(`/api/board/${boardid}/list/${listid}/task/${taskid}/attachments/${attachmentid}`, {
        headers: {
          Authorization: 'Bearer ' + authentication.getToken()
        }
      });
    };

    return {
      addAttachment,
      deleteAttachment
    }
  }

})();