(() => {

  let pageHeader = (() => {
    return {
      restrict: 'EA',
      templateUrl: '/common/directives/pageHeader/pageHeader.template.html',
      controller: 'pageHeaderCtrl as phvm'
    };
  });

  angular
    .module('trelloClone')
    .directive('pageHeader', pageHeader);

})();