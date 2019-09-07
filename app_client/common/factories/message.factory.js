(() => {
  const messageFactory = () => {
    // message for send between home and login pages
    return {
      message: '',
    };
  };

  // eslint-disable-next-line no-undef
  angular.module('trelloClone').factory('messageFactory', messageFactory);
})();
