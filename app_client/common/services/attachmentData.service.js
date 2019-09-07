(() => {
  // eslint-disable-next-line no-undef,no-use-before-define
  angular.module('trelloClone').service('attachmentData', attachmentData);

  // CRUD requests for attachments
  // eslint-disable-next-line no-use-before-define
  attachmentData.$inject = ['$http', 'authentication'];
  function attachmentData($http, authentication) {
    const addAttachment = (
      boardid,
      listid,
      taskid,
      file,
      listName,
      taskName
    ) => {
      const fd = new FormData();
      fd.append('listName', listName);
      fd.append('taskName', taskName);
      fd.append('attachmentFile', file);
      return $http.post(
        `/api/board/${boardid}/list/${listid}/task/${taskid}/attachments`,
        fd,
        {
          // eslint-disable-next-line no-undef
          transformRequest: angular.identity,
          headers: {
            Authorization: `Bearer ${authentication.getToken()}`,
            'Content-Type': undefined,
          },
        }
      );
    };

    const deleteAttachment = (boardid, listid, taskid, attachmentid) => {
      return $http.delete(
        `/api/board/${boardid}/list/${listid}/task/${taskid}/attachments/${attachmentid}`,
        {
          headers: {
            Authorization: `Bearer ${authentication.getToken()}`,
          },
        }
      );
    };

    return {
      addAttachment,
      deleteAttachment,
    };
  }
})();
