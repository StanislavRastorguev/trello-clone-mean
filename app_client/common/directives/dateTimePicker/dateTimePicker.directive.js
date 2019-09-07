(() => {
  const dateTimePicker = () => {
    return {
      restrict: 'EA',
      templateUrl:
        '/common/directives/dateTimePicker/dateTimePicker.template.html',
    };
  };

  // eslint-disable-next-line no-undef
  angular.module('trelloClone').directive('dateTimePicker', dateTimePicker);
})();
