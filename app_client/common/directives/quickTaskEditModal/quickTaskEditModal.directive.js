(() => {
  const quickTaskEditModal = () => {
    return {
      restrict: 'EA',
      templateUrl:
        '/common/directives/quickTaskEditModal/quickTaskEditModal.template.html',
    };
  };

  // eslint-disable-next-line no-undef
  angular
    .module('trelloClone')
    .directive('quickTaskEditModal', quickTaskEditModal);
})();
