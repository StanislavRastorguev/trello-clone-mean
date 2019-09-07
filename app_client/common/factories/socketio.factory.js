(() => {
  // eslint-disable-next-line no-undef,no-use-before-define
  angular.module('trelloClone').factory('socketioFactory', socketioFactory);

  // eslint-disable-next-line no-use-before-define
  socketioFactory.$inject = ['socketFactory'];
  function socketioFactory(socketFactory) {
    return socketFactory();
  }
})();
