(() => {

  angular
    .module('trelloClone')
    .factory('socketioFactory', socketioFactory);

  socketioFactory.$inject = ['socketFactory'];
  function socketioFactory(socketFactory) {
    return socketFactory();
  }

})();