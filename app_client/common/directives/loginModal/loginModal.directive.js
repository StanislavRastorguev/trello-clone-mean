(() => {

  let loginModal = (() => {
    return {
      restrict: 'EA',
      templateUrl: '/common/directives/loginModal/loginModal.template.html',
      controller: 'loginModalCtrl as lmvm'
    };
  });

  angular
    .module('trelloClone')
    .directive('loginModal', loginModal);

})();