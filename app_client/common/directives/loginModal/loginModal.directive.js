(() => {
  const loginModal = () => {
    return {
      restrict: 'EA',
      templateUrl: '/common/directives/loginModal/loginModal.template.html',
      controller: 'loginModalCtrl as lmvm',
    };
  };

  // eslint-disable-next-line no-undef
  angular.module('trelloClone').directive('loginModal', loginModal);
})();
