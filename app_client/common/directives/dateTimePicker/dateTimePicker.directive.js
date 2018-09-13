(() => {

  let dateTimePicker = (() => {
    return {
      restrict: 'EA',
      templateUrl: '/common/directives/dateTimePicker/dateTimePicker.template.html'
    };
  });

  angular
    .module('trelloClone')
    .directive('dateTimePicker', dateTimePicker);

})();