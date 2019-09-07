(() => {
  const changeTaskPosition = () => {
    return {
      restrict: 'EA',
      templateUrl:
        '/common/directives/changeTaskPosition/changeTaskPosition.template.html',
    };
  };

  // eslint-disable-next-line no-undef
  angular
    .module('trelloClone')
    .directive('changeTaskPosition', changeTaskPosition);
})();
