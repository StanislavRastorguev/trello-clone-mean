(() => {

  let changeTaskPosition = (() => {
    return {
      restrict: 'EA',
      templateUrl: '/common/directives/changeTaskPosition/changeTaskPosition.template.html'
    };
  });

  angular
    .module('trelloClone')
    .directive('changeTaskPosition', changeTaskPosition);

})();