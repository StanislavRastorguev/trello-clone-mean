(() => {
  const taskEditModal = () => {
    return {
      restrict: 'EA',
      templateUrl:
        '/common/directives/taskEditModal/taskEditModal.template.html',
    };
  };

  // eslint-disable-next-line no-undef
  angular.module('trelloClone').directive('taskEditModal', taskEditModal);
})();
