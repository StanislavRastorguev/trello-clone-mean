(() => {

  let messageFactory = (() => {
    //message for send between home and login pages
    return {
      message: ''
    };
  });

  angular
    .module('trelloClone')
    .factory('messageFactory', messageFactory);

})();