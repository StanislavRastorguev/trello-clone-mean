(() => {

  let taskEditModal = (() => {
    return {
      restrict: 'EA',
      templateUrl: '/common/directives/taskEditModal/taskEditModal.template.html'
    };
  });

  angular
    .module('trelloClone')
    .directive('taskEditModal', taskEditModal);

})();