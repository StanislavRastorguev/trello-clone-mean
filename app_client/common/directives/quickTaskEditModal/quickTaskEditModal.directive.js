(() => {

  let quickTaskEditModal = (() => {
    return {
      restrict: 'EA',
      templateUrl: '/common/directives/quickTaskEditModal/quickTaskEditModal.template.html'
    };
  });

  angular
    .module('trelloClone')
    .directive('quickTaskEditModal', quickTaskEditModal);

})();